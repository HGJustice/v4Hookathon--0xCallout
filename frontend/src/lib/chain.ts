import { arbitrumSepolia } from "viem/chains";

/**
 * The one chain the app runs on. Change it here (and redeploy the contracts) to switch.
 * Kept apart from the wagmi config so contract code can use it without pulling in Privy.
 */
export const appChain = arbitrumSepolia;
