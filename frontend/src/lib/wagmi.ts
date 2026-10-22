import { createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";
import { baseSepolia } from "wagmi/chains";

/** The one chain the app runs on. Change it here (and redeploy contracts) to switch. */
export const appChain = baseSepolia;

/** Optional dedicated RPC; falls back to the chain's public endpoint. */
const rpcUrl = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || undefined;

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
