import type { Address, Hash } from "viem";

export type MarketCreatedEvent = {
  transactionHash: Hash | null;
  marketplaceID: bigint | undefined;
  title: string | undefined;
  initializer: Address | undefined;
};

export async function onMarketCreated(event: MarketCreatedEvent): Promise<void> {
  console.log("MarketCreated", {
    marketplaceID: event.marketplaceID?.toString(),
    title: event.title,
    initializer: event.initializer,
    tx: event.transactionHash,
  });
}