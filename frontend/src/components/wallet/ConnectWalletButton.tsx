"use client";

import { useEffect, useState } from "react";
import { useConnectWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { useAccount } from "wagmi";
import { privyAppId } from "@/lib/privy";
import AccountMenu, { type MenuPlacement } from "./AccountMenu";
import { primaryPill } from "./walletStyles";

/** How long to wait for Privy to hand its wallet to wagmi before offering to connect. */
const WALLET_SYNC_GRACE_MS = 3000;

/**
 * The navbar's wallet control, one step at a time:
 * Sign in → (signed in, no wallet in this browser) Connect Wallet →
 * account menu. The wallet's network doesn't matter here: reads use the app's own RPC, and
 * each transaction asks the wallet to switch networks when it's sent. A "switch network"
 * button in the navbar would hide the account menu from anyone whose wallet can't switch.
 */
export default function ConnectWalletButton({ menuPlacement }: { menuPlacement?: MenuPlacement }) {
  if (!privyAppId) {
    return (
      <button
        type="button"
        disabled
        title="Sign-in isn't configured yet (NEXT_PUBLIC_PRIVY_APP_ID)"
        className={`${primaryPill} cursor-not-allowed opacity-50`}
      >
        Sign in
      </button>
    );
  }
  return <WalletButton menuPlacement={menuPlacement} />;
}

function WalletButton({ menuPlacement }: { menuPlacement?: MenuPlacement }) {
  const { ready, authenticated, login } = usePrivy();
  const { ready: walletsReady, wallets } = useWallets();
  const { connectWallet } = useConnectWallet();
  const { setActiveWallet } = useSetActiveWallet();
  const { address } = useAccount();

  // While a wallet exists but wagmi hasn't picked it up yet, hold off briefly to avoid a
  // "Connect" flash, but never forever, or the user would be left with no button at all.
  const syncing = authenticated && !address && (!walletsReady || wallets.length > 0);
  const syncStalled = useBecameStale(syncing, WALLET_SYNC_GRACE_MS);

  // Until Privy has restored the session the state is unknown: hold the space so nothing shifts.
  if (!ready || (syncing && !syncStalled)) {
    return (
      <span aria-hidden="true" className={`${primaryPill} invisible`}>
        Sign in
      </span>
    );
  }

  if (!authenticated) {
    return (
      <button type="button" onClick={() => login()} className={primaryPill}>
        Sign in
      </button>
    );
  }

  // Signed in with a wallet that isn't available in this browser (e.g. an extension on
  // another device), or one wagmi didn't pick up: re-activate it, or connect another.
  if (!address) {
    const [wallet] = wallets;
    return (
      <button
        type="button"
        onClick={() => (wallet ? setActiveWallet(wallet).catch(() => connectWallet()) : connectWallet())}
        className={primaryPill}
      >
        Connect Wallet
      </button>
    );
  }

  return <AccountMenu address={address} placement={menuPlacement} />;
}

/** True once `active` has stayed true for `ms`; false again as soon as it turns false. */
function useBecameStale(active: boolean, ms: number) {
  const [stale, setStale] = useState(false);
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setStale(true), ms);
    return () => {
      clearTimeout(timer);
      setStale(false);
    };
  }, [active, ms]);
  return active && stale;
}
