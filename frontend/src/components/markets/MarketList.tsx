"use client";

import { useState } from "react";
import { getErrorMessage } from "@/lib/contracts/errors";
import { marketplaceFactory } from "@/lib/contracts/marketplaceFactory";
import { useMarkets } from "@/lib/markets/hooks";
import type { Market } from "@/lib/markets/market";
import { useNow } from "@/lib/useNow";
import MarketTile from "./MarketTile";
import Notice from "./Notice";

type SortId = "newest" | "ending" | "stake";

const byBigInt = (a: bigint, b: bigint) => (a === b ? 0 : a > b ? 1 : -1);

// `markets` arrive newest first, and Array.sort is stable, so "newest" is a no-op sort.
const SORTS: readonly { id: SortId; label: string; compare: (a: Market, b: Market, nowSeconds: bigint) => number }[] = [
  { id: "newest", label: "Newest", compare: () => 0 },
  {
    id: "ending",
    label: "Ending soon",
    // Deadlines still ahead come first, soonest first; ones already passed follow, latest first.
    compare: (a, b, now) => {
      const upcoming = Number(b.deadline > now) - Number(a.deadline > now);
      return upcoming || (a.deadline > now ? byBigInt(a.deadline, b.deadline) : byBigInt(b.deadline, a.deadline));
    },
  },
  { id: "stake", label: "Most at stake", compare: (a, b) => byBigInt(b.balance, a.balance) },
];

const grid = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

// Search box and sort menu share one look.
const control =
  "h-11 rounded-full border border-white/15 bg-white/[0.03] text-sm transition-colors hover:border-white/30 focus:border-white/40 focus:bg-white/[0.05] focus:outline-none";

/** Every market, searchable by question and sortable. */
export default function MarketList() {
  const markets = useMarkets();
  const now = useNow();
  const [sortId, setSortId] = useState<SortId>("newest");
  const [query, setQuery] = useState("");

  if (markets.isPending || now === null) return <Skeleton />;
  if (markets.isError) {
    return (
      <Notice title="Couldn't load markets" role="alert">
        <p>{getErrorMessage(markets.error)}</p>
        {marketplaceFactory && (
          <button
            type="button"
            onClick={() => markets.refetch()}
            className="mt-6 inline-flex h-11 items-center rounded-full border border-white/15 px-6 text-white transition-colors hover:border-white/40"
          >
            Try again
          </button>
        )}
      </Notice>
    );
  }
  if (markets.data.length === 0) {
    return (
      <Notice title="No markets yet">
        <p>Markets start from an argument on Farcaster. The first one will show up here.</p>
      </Notice>
    );
  }

  const nowSeconds = BigInt(Math.floor(now / 1000));
  const needle = query.trim().toLowerCase();
  const { compare } = SORTS.find(({ id }) => id === sortId)!;
  const shown = markets.data
    .filter((market) => !needle || market.title.toLowerCase().includes(needle))
    .sort((a, b) => compare(a, b, nowSeconds));

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
            <label>
              <span className="sr-only">Search markets</span>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/40"
                aria-hidden="true"
              >
                <circle cx="9" cy="9" r="5.5" />
                <path d="m13.5 13.5 3 3" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                className={`${control} w-full pr-10 pl-11 placeholder:text-white/40 [&::-webkit-search-cancel-button]:hidden`}
              />
            </label>
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:text-white focus-visible:outline-none"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="size-3.5" aria-hidden="true">
                  <path d="m5 5 10 10M15 5 5 15" />
                </svg>
              </button>
            )}
          </div>
          <label className="relative">
            <span className="sr-only">Sort markets</span>
            <select
              value={sortId}
              onChange={(event) => setSortId(event.target.value as SortId)}
              className={`${control} cursor-pointer appearance-none pr-10 pl-5 [&>option]:bg-surface [&>option]:text-white`}
            >
              {SORTS.map(({ id, label }) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-white/50"
              aria-hidden="true"
            >
              <path d="m5 8 5 5 5-5" />
            </svg>
          </label>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-white/10 px-6 py-12 text-center text-white/60">
          <p>No markets match &quot;{query.trim()}&quot;.</p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-4 text-white underline underline-offset-4 hover:text-brand"
          >
            Clear search
          </button>
        </div>
      ) : (
        <ul role="list" className={`mt-8 ${grid}`}>
          {shown.map((market, i) => (
            <li
              key={market.marketplaceID.toString()}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
            >
              <MarketTile market={market} now={now} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Skeleton() {
  return (
    <div aria-busy="true" aria-label="Loading markets">
      <div className="h-11" aria-hidden="true" />
      <ul role="list" className={`mt-8 ${grid}`} aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="paper-card relative h-[172px] animate-pulse rounded-xs" />
        ))}
      </ul>
    </div>
  );
}
