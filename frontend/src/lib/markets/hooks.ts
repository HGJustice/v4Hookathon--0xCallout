import { useCallback, useRef, useState } from "react";
import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Hash } from "viem";
import { useAccount, useConfig, type Config } from "wagmi";
import { hashFn } from "wagmi/query";
import { marketplaceFactory } from "@/lib/contracts/marketplaceFactory";
import type { Market, MarketData } from "./market";
import { fetchMarket, fetchMarkets, fetchPoolState, fetchPosition } from "./reads";
import { createMarket, disputeOutcome, placeBet, proposeOutcome, redeem } from "./writes";

/** Query keys for market data, so a write can refresh everything it may have changed. */
export const marketKeys = {
  all: ["markets"] as const,
  list: (limit: number) => [...marketKeys.all, "list", limit] as const,
  detail: (id: bigint) => [...marketKeys.all, "detail", id] as const,
  pool: (id: bigint) => [...marketKeys.all, "pool", id] as const,
  position: (id: bigint, account: string) => [...marketKeys.all, "position", id, account] as const,
};

// Shared by every market query:
// - queryKeyHashFn: keys hold bigint ids, which TanStack's default hash (JSON.stringify)
//   can't serialise. (wagmi/query's useQuery sets this too, but loses the data's type.)
// - staleTime: a few seconds, so mounting another component or refocusing the window
//   doesn't re-run the RPC calls each time. Writes invalidate the data straight away.
// - retry: with no factory address configured the fetchers throw MarketsUnavailableError
//   without touching the network, so surface it at once (as `error`) instead of retrying.
const queryOptions = { queryKeyHashFn: hashFn, staleTime: 5_000, retry: marketplaceFactory ? 3 : false } as const;

/** The newest markets, newest first. */
export function useMarkets({ limit = 50 }: { limit?: number } = {}) {
  const config = useConfig();
  return useQuery({
    ...queryOptions,
    queryKey: marketKeys.list(limit),
    queryFn: () => fetchMarkets(config, { limit }),
  });
}

/** One market by id; `data` is null if no market has that id. Idle while `id` is undefined. */
export function useMarket(id: bigint | undefined) {
  const config = useConfig();
  return useQuery({
    ...queryOptions,
    queryKey: marketKeys.detail(id ?? 0n),
    queryFn: id === undefined ? skipToken : () => fetchMarket(config, id),
  });
}

/** What a market's pool holds and how much of each token exists, for quoting bets. Idle until the market is known. */
export function usePoolState(market: Pick<Market, "marketplaceID" | "pool" | "yesToken" | "noToken" | "poolManager"> | undefined) {
  const config = useConfig();
  return useQuery({
    ...queryOptions,
    queryKey: marketKeys.pool(market?.marketplaceID ?? 0n),
    queryFn: market ? () => fetchPoolState(config, market) : skipToken,
  });
}

/** The connected account's YES and NO shares in a market. Idle until both are known. */
export function usePosition(market: Pick<MarketData, "marketplaceID" | "yesToken" | "noToken"> | undefined) {
  const config = useConfig();
  const { address } = useAccount();
  return useQuery({
    ...queryOptions,
    queryKey: marketKeys.position(market?.marketplaceID ?? 0n, address ?? ""),
    queryFn: market && address ? () => fetchPosition(config, market, address) : skipToken,
  });
}

export const useCreateMarket = () => useMarketWrite(createMarket);
export const usePlaceBet = () => useMarketWrite(placeBet);
export const useProposeOutcome = () => useMarketWrite(proposeOutcome);
export const useDisputeOutcome = () => useMarketWrite(disputeOutcome);
export const useRedeem = () => useMarketWrite(redeem);

type WriteAction<Variables, Result> = (
  config: Config,
  variables: Variables,
  onSubmitted: (hash: Hash) => void,
) => Promise<Result>;

/**
 * A market write as a TanStack mutation: `mutate` / `mutateAsync`, `isPending`, `error`
 * (show it with getErrorMessage) and `data`, plus `hash` once the wallet has sent the
 * transaction. So `isPending && !hash` is "confirm in your wallet" and `isPending && hash`
 * is "waiting for the network". On success it refreshes market data and the wallet's ETH
 * balance, and stays pending until that's done so the UI never shows stale odds.
 */
function useMarketWrite<Variables, Result>(action: WriteAction<Variables, Result>) {
  const config = useConfig();
  const queryClient = useQueryClient();
  const [hash, setHash] = useState<Hash>();
  // Each run takes a new id; a run that was reset or superseded can no longer set `hash`
  // (e.g. a transaction confirmed in the wallet after its dialog was closed).
  const currentRun = useRef(0);

  const mutation = useMutation({
    mutationFn: (variables: Variables) => {
      const run = ++currentRun.current;
      return action(config, variables, (submitted) => {
        if (run === currentRun.current) setHash(submitted);
      });
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: marketKeys.all }),
        queryClient.invalidateQueries({ queryKey: ["balance"] }), // wagmi's useBalance
      ]),
  });

  // TanStack's mutate, mutateAsync and reset are stable, so these are too. Starting a run
  // clears the previous hash in the same render the mutation turns pending.
  const { mutate: startMutate, mutateAsync: startMutateAsync, reset: resetMutation } = mutation;
  const mutate = useCallback<typeof startMutate>(
    (...args) => {
      setHash(undefined);
      startMutate(...args);
    },
    [startMutate],
  );
  const mutateAsync = useCallback<typeof startMutateAsync>(
    (...args) => {
      setHash(undefined);
      return startMutateAsync(...args);
    },
    [startMutateAsync],
  );
  const reset = useCallback(() => {
    currentRun.current++;
    setHash(undefined);
    resetMutation();
  }, [resetMutation]);

  return { ...mutation, mutate, mutateAsync, reset, hash };
}
