import { getAddress, isAddress, type Address } from "viem";
import { appChain } from "@/lib/chain";
import { marketplaceFactoryAbi } from "./generated";

/** The MarketplaceFactory deployment on appChain, from NEXT_PUBLIC_MARKETPLACE_FACTORY_ADDRESS. */
function readFactoryAddress(): Address | null {
  const value = process.env.NEXT_PUBLIC_MARKETPLACE_FACTORY_ADDRESS?.trim();
  if (!value) return null;
  // Strict: a mixed-case address must have a valid checksum, which catches typos.
  if (!isAddress(value)) {
    console.warn(
      `NEXT_PUBLIC_MARKETPLACE_FACTORY_ADDRESS is not a valid address ("${value}"; check for typos). Markets are disabled.`,
    );
    return null;
  }
  return getAddress(value);
}

const address = readFactoryAddress();

/**
 * Address, ABI and chain of the MarketplaceFactory, ready to spread into wagmi calls:
 * `readContract(config, { ...marketplaceFactory, functionName: "getMarket", args: [id] })`.
 * Null until NEXT_PUBLIC_MARKETPLACE_FACTORY_ADDRESS is set; callers show markets as unavailable.
 */
export const marketplaceFactory = address
  ? ({ address, abi: marketplaceFactoryAbi, chainId: appChain.id } as const)
  : null;

export type MarketplaceFactoryContract = NonNullable<typeof marketplaceFactory>;

/** Thrown by market reads and writes when no factory address is configured. */
export class MarketsUnavailableError extends Error {
  constructor() {
    super("Markets aren't available yet: no contract address is configured.");
    this.name = "MarketsUnavailableError";
  }
}

/** The configured factory, or a MarketsUnavailableError for callers that need one. */
export function requireMarketplaceFactory(): MarketplaceFactoryContract {
  if (!marketplaceFactory) throw new MarketsUnavailableError();
  return marketplaceFactory;
}
