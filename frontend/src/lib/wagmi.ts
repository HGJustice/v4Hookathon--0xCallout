import { createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";

/** The one chain the app runs on. Change it here (and redeploy contracts) to switch. */
export const appChain = arbitrumSepolia;

/** Optional dedicated RPC for appChain; falls back to the chain's public endpoint. */
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || undefined;

// The app used to run on Base Sepolia with NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL. That variable is
// now ignored, so say so rather than silently falling back to the public endpoint.
if (process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL) {
  console.warn(
    `NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL is no longer used. Set NEXT_PUBLIC_RPC_URL to an ${appChain.name} RPC instead.`,
  );
}

// Privy decides which wallet is connected (embedded or external) and keeps wagmi in
// sync; the app reads state and sends transactions with ordinary wagmi hooks.
export const wagmiConfig = createConfig({
  chains: [appChain],
  transports: { [appChain.id]: http(rpcUrl) },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
