"use client";

import { useState, type ReactNode } from "react";
import { getErrorMessage } from "@/lib/contracts/errors";
import { marketplaceFactory } from "@/lib/contracts/marketplaceFactory";
import { useMarkets } from "@/lib/markets/hooks";
import { getMarketStatus, type Market, type MarketStatus } from "@/lib/markets/market";
import { useNow } from "@/lib/useNow";
import MarketTile from "./MarketTile";

type Filter = { id: "all" | "open" | "resolving" | "resolved"; label: string; statuses: readonly MarketStatus[] | null };

const FILTERS: readonly Filter[] = [
  { id: "all", label: "All", statuses: null },
  { id: "open", label: "Open", statuses: ["open"] },
  { id: "resolving", label: "Resolving", statuses: ["closed", "proposed", "disputed"] },
  { id: "resolved", label: "Resolved", statuses: ["resolved"] },
];

const inFilter = (filter: Filter, status: MarketStatus) => filter.statuses === null || filter.statuses.includes(status);

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

/** Every market, filterable by stage, searchable by question and sortable. */
export default function MarketList() {
  const markets = useMarkets();
  const now = useNow();
  const [filterId, setFilterId] = useState<Filter["id"]>("all");
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
  const statuses = new Map(markets.data.map((market) => [market, getMarketStatus(market, nowSeconds)]));
  const active = FILTERS.find(({ id }) => id === filterId)!;
  const needle = query.trim().toLowerCase();
  const matchesQuery = (market: Market) => !needle || market.title.toLowerCase().includes(needle);
  const { compare } = SORTS.find(({ id }) => id === sortId)!;
  const shown = markets.data
    .filter((market) => matchesQuery(market) && inFilter(active, statuses.get(market)!))
    .sort((a, b) => compare(a, b, nowSeconds));

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* One row that scrolls sideways on narrow screens rather than wrapping. */}
        <div
          role="group"
          aria-label="Filter markets"
          className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0"
        >
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              aria-pressed={filter === active}
              onClick={() => setFilterId(filter.id)}
              className="flex h-11 shrink-0 items-center gap-2 rounded-full border border-white/15 px-5 text-white/70 transition-colors hover:border-white/40 hover:text-white focus-visible:border-white/40 focus-visible:text-white focus-visible:outline-none aria-pressed:border-brand/60 aria-pressed:bg-brand/10 aria-pressed:text-brand"
            >
              {filter.label}
              <span className="text-sm opacity-60 tabular-nums">
                {markets.data.filter((market) => matchesQuery(market) && inFilter(filter, statuses.get(market)!)).length}
              </span>
            </button>
          ))}
        </div>

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
          <p>{needle ? `No markets match "${query.trim()}".` : `No ${active.label.toLowerCase()} markets right now.`}</p>
          {(needle || filterId !== "all") && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFilterId("all");
              }}
              className="mt-4 text-white underline underline-offset-4 hover:text-brand"
            >
              Clear filters
            </button>
          )}
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

function Notice({ title, role, children }: { title: string; role?: "alert"; children: ReactNode }) {
  return (
    <div role={role} className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center">
      <p className="font-display text-2xl font-medium tracking-tight">{title}</p>
      <div className="mx-auto mt-3 max-w-[460px] text-white/60">{children}</div>
    </div>
  );
}

function Skeleton() {
  return (
    <div aria-busy="true" aria-label="Loading markets">
      <div className="h-11" aria-hidden="true" />
      <ul role="list" className={`mt-8 ${grid}`} aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="h-[262px] animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />
        ))}
      </ul>
    </div>
  );
}
