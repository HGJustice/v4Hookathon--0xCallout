import type { PrivyClientConfig } from "@privy-io/react-auth";
import { appChain } from "./wagmi";

const rawAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim() ?? "";

/**
 * From the Privy dashboard (https://dashboard.privy.io). Privy app ids are 25 characters and
 * PrivyProvider throws on anything else, taking the whole page down, so a missing or
 * malformed id disables sign-in instead.
 */
export const privyAppId = rawAppId.length === 25 ? rawAppId : "";

if (rawAppId && !privyAppId) {
  console.warn("NEXT_PUBLIC_PRIVY_APP_ID isn't a valid Privy app id (25 characters); sign-in is disabled.");
}

export const privyConfig: PrivyClientConfig = {
  // Socials first: most people arriving from a Farcaster thread don't have a wallet yet.
  // Each method must also be enabled in the dashboard (User management → Authentication).
  loginMethods: ["farcaster", "email", "google", "wallet"],
  // Anyone who signs in without a wallet gets a self-custodial one, with no seed phrase.
  embeddedWallets: { ethereum: { createOnLogin: "users-without-wallets" } },
  supportedChains: [appChain],
  defaultChain: appChain,
  appearance: {
    theme: "#141414",
    accentColor: "#f6c1d3",
    logo: "",
    landingHeader: "Sign in to Multiverse",
    loginMessage: "Bet on the arguments you care about.",
    showWalletLoginFirst: false,
    walletChainType: "ethereum-only",
  },
  // Optional: Privy falls back to its own WalletConnect project when unset.
  walletConnectCloudProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || undefined,
};
