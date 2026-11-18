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

// Stories sit in newspaper columns: a hairline rule between columns and under each row.
// The list runs a gutter wider than its frame on both sides, and the frame clips it, so the
// outer column rules are hidden and the first column's text lines up with the page edge.
const frame = "overflow-hidden";
const grid = "-mx-6 grid sm:grid-cols-2 lg:grid-cols-3";
const story = "border-b border-l border-foreground/25 px-6 py-7";
// The first story leads the page, across two columns.
const leadStory = "sm:col-span-2";

// Search box and sort menu share one look: square, ruled in ink.
const control =
  "h-10 rounded-xs border border-foreground/40 bg-transparent text-sm focus:border-foreground focus:outline-none";

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
            className="mt-6 inline-flex h-11 items-center rounded-xs border border-foreground/40 px-6 text-foreground transition-colors hover:border-foreground/40"
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
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
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
                className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-foreground/65"
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
                className={`${control} w-full pr-10 pl-11 placeholder:text-foreground/60 [&::-webkit-search-cancel-button]:hidden`}
              />
            </label>
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-3 flex size-6 -translate-y-1/2 items-center justify-center rounded-xs text-foreground/65 transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:bg-foreground/10 focus-visible:text-foreground focus-visible:outline-none"
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
              className={`${control} cursor-pointer appearance-none pr-10 pl-5 [&>option]:bg-background [&>option]:text-foreground`}
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
              className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-foreground/65"
              aria-hidden="true"
            >
              <path d="m5 8 5 5 5-5" />
            </svg>
          </label>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="mt-6 border-y border-foreground px-6 py-12 text-center text-foreground/70">
          <p>No markets match &quot;{query.trim()}&quot;.</p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-4 text-foreground underline underline-offset-4 hover:text-brand"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className={`mt-6 ${frame}`}>
          <ul role="list" className={grid}>
            {shown.map((market, i) => (
              <li key={market.marketplaceID.toString()} className={`${story} ${i === 0 ? leadStory : ""}`}>
                <MarketTile market={market} now={now} lead={i === 0} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function Skeleton() {
  return (
    <div aria-busy="true" aria-label="Loading markets">
      <div className="mt-6 h-10" aria-hidden="true" />
      <div className={`mt-6 ${frame}`} aria-hidden="true">
        <ul role="list" className={grid}>
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i} className={`${story} ${i === 0 ? leadStory : ""}`}>
              <div className="h-3 w-32 animate-pulse bg-foreground/10" />
              <div className={`mt-3 animate-pulse bg-foreground/10 ${i === 0 ? "h-24" : "h-14"}`} />
              <div className="mt-4 h-3 w-24 animate-pulse bg-foreground/10" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
