import type { Address } from "viem";
import { env } from "../lib/env.js";
import { publicClient } from "./client.js";
import { marketCreatedEvent } from "./factory-events.js";
import { getCheckpoint, setCheckpoint } from "./checkpoint.js";
import { onMarketCreated } from "./on-market-created.js";

const CONFIRMATIONS = 2n;
const MAX_BLOCK_RANGE = 500n;
const POLL_INTERVAL_MS = 5_000;

export function startFactoryWatcher(): void {
  const address = env.FACTORY_ADDRESS as Address;
  let running = false;

  const tick = async (): Promise<void> => {
    if (running) return; // never run two scans at once
    running = true;
    try {
      await scan(address);
    } catch (error) {
      console.error("factory watcher failed", error);
    } finally {
      running = false;
    }
  };

  void tick();
  setInterval(() => void tick(), POLL_INTERVAL_MS);
}

async function scan(address: Address): Promise<void> {
  const safeHead: bigint = (await publicClient.getBlockNumber()) - CONFIRMATIONS;

  const stored: bigint | null = await getCheckpoint();
  if (stored === null) {
    // First run: start at the current block, so history isn't replayed.
    await setCheckpoint(safeHead + 1n);
  }
  let from: bigint = stored ?? safeHead + 1n;

  while (from <= safeHead) {
    const windowEnd: bigint = from + MAX_BLOCK_RANGE - 1n;
    const to: bigint = windowEnd < safeHead ? windowEnd : safeHead;

    const logs = await publicClient.getLogs({
      address,
      event: marketCreatedEvent,
      fromBlock: from,
      toBlock: to,
    });

    for (const log of logs) {
        const { args, transactionHash } = log;
        if (!args) continue;
  
        await onMarketCreated({
          transactionHash,
          marketplaceID: args.marketplaceID,
          title: args.title,
          initializer: args.initializer,
        });
      }

    // Save progress only after the whole range is handled.
    await setCheckpoint(to + 1n);
    from = to + 1n;
  }
}