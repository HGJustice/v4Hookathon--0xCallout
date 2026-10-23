"use client";

import { useEffect, useRef } from "react";
import sdk from "@farcaster/miniapp-sdk";
import { useConnectWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { useLoginToMiniApp } from "@privy-io/react-auth/farcaster";

/** Resolves false outside a Farcaster client instead of throwing. */
const isInMiniApp = () => sdk.isInMiniApp().catch(() => false);

type ProviderAnnouncement = CustomEvent<{ info: { rdns: string }; provider: unknown }>;

/**
 * The id Privy lists the Farcaster app's wallet under: its EIP-6963 rdns. The host
 * announces it on request; we pick the announcement carrying the SDK's own provider.
 */
async function hostWalletId(timeoutMs = 2000): Promise<string | undefined> {
  const hostProvider = await sdk.wallet.getEthereumProvider().catch(() => undefined);
  if (!hostProvider) return undefined;
  return new Promise((resolve) => {
    const finish = (id?: string) => {
      clearTimeout(timer);
      window.removeEventListener("eip6963:announceProvider", onAnnounce);
      resolve(id);
    };
    const onAnnounce = (event: Event) => {
      const { info, provider } = (event as ProviderAnnouncement).detail;
      if (provider === hostProvider) finish(info.rdns);
    };
    const timer = setTimeout(finish, timeoutMs);
    window.addEventListener("eip6963:announceProvider", onAnnounce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
  });
}

/**
 * When the site is opened as a Farcaster mini-app: tell the host the app is ready
 * (hides its splash screen) and sign the user in with the Farcaster account they're
 * already using, one native confirmation instead of a login modal, then connect the
 * wallet the Farcaster app provides, without making the user pick it from a list.
 * On the regular web this does nothing.
 */
export default function FarcasterMiniApp() {
  const { ready, authenticated } = usePrivy();
  const { initLoginToMiniApp, loginToMiniApp } = useLoginToMiniApp();
  const { ready: walletsReady, wallets } = useWallets();
  const { connectWallet } = useConnectWallet();
  const attempted = useRef(false);
  const connectAttempted = useRef(false);

  // Signal "ready" once, whatever the sign-in state.
  useEffect(() => {
    void isInMiniApp().then((inMiniApp) => {
      if (inMiniApp) void sdk.actions.ready();
    });
  }, []);

  // Try once per visit, so declining (or logging out) never loops back into a prompt.
  useEffect(() => {
    if (!ready || authenticated || attempted.current) return;
    attempted.current = true;
    void (async () => {
      if (!(await isInMiniApp())) return;
      try {
        const { nonce } = await initLoginToMiniApp();
        const { message, signature } = await sdk.actions.signIn({ nonce });
        await loginToMiniApp({ message, signature });
      } catch {
        // Declined or unsupported by the host: the Sign in button still works.
      }
    })();
  }, [ready, authenticated, initLoginToMiniApp, loginToMiniApp]);

  // Privy can't create embedded wallets inside mini-apps, so use the host's wallet. Once per
  // visit, like sign-in; if it's skipped or fails, the Connect Wallet button remains.
  const hasWallet = wallets.length > 0;
  useEffect(() => {
    if (!authenticated || !walletsReady || hasWallet || connectAttempted.current) return;
    connectAttempted.current = true;
    void (async () => {
      if (!(await isInMiniApp())) return;
      const walletId = await hostWalletId();
      if (walletId) connectWallet({ preSelectedWalletId: walletId });
    })();
  }, [authenticated, walletsReady, hasWallet, connectWallet]);

  return null;
}
