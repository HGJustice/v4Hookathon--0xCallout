"use client";

import Link from "next/link";
import { getErrorMessage } from "@/lib/contracts/errors";
import { marketplaceFactory } from "@/lib/contracts/marketplaceFactory";
import { formatRelativeTime } from "@/lib/format";
import { useMarket } from "@/lib/markets/hooks";
import { getMarketStatus, STATUS_LABEL, type Market } from "@/lib/markets/market";
import { useNow } from "@/lib/useNow";
import { ArrowRight } from "../../icons";
import Notice from "../Notice";
import OddsCard from "./OddsCard";
import PositionCard from "./PositionCard";
import { DisputedPanel, DisputePanel, ProposePanel, RedeemPanel } from "./ResolutionPanels";
import StatusTimeline from "./StatusTimeline";
import TradePanel from "./TradePanel";

/** One market: its odds and progress on the left, and whatever you can do with it right now on the right. */
export default function MarketDetail({ id }: { id: string }) {
  const market = useMarket(BigInt(id));
  const now = useNow();

  if (market.isPending || now === null) return <DetailSkeleton />;
  if (market.isError) {
    return (
      <Notice title="Couldn't load this market" role="alert">
        <p>{getErrorMessage(market.error)}</p>
        {marketplaceFactory && (
          <button
            type="button"
            onClick={() => market.refetch()}
            className="mt-6 inline-flex h-11 items-center rounded-full border border-white/15 px-6 text-white transition-colors hover:border-white/40"
          >
            Try again
          </button>
        )}
      </Notice>
    );
  }
  if (!market.data) {
    return (
      <Notice title="No market here">
        <p>
          There&apos;s no market #{id}. <BackLink />
        </p>
      </Notice>
    );
  }
  return <Detail market={market.data} now={now} />;
}

function BackLink() {
  return (
    <Link href="/markets" className="underline underline-offset-4 hover:text-brand">
      See all markets
    </Link>
  );
}

function Detail({ market, now }: { market: Market; now: number }) {
  const status = getMarketStatus(market, BigInt(Math.floor(now / 1000)));
  const deadline = Number(market.deadline) * 1000;

  return (
    <div>
      <Link
        href="/markets"
        className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
      >
        <ArrowRight className="size-4 rotate-180" /> All markets
      </Link>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span
          className={`inline-flex h-8 items-center rounded-full border px-3.5 text-sm font-medium ${
            status === "open" ? "border-yes/50 text-yes" : "border-white/20 text-white/80"
          }`}
        >
          {STATUS_LABEL[status]}
        </span>
        {status !== "resolved" && (
          <span className="text-sm text-white/60">
            {deadline > now ? `Ends ${formatRelativeTime(deadline, now)}` : `Ended ${formatRelativeTime(deadline, now)}`}
          </span>
        )}
      </div>

      <h1 className="mt-4 max-w-[900px] font-display text-2xl leading-snug font-semibold tracking-tight text-white sm:text-4xl sm:leading-tight">
        {market.title}
      </h1>

      {/* The odds and the action start on the same line; on a phone they stack in that order. */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-x-8">
        <div className="min-w-0 lg:col-start-1">
          <OddsCard market={market} now={now} />
        </div>

        <aside className="lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          {status === "open" && <TradePanel market={market} />}
          {status === "closed" && <ProposePanel market={market} />}
          {status === "proposed" && <DisputePanel market={market} />}
          {status === "disputed" && <DisputedPanel market={market} />}
          {status === "resolved" && <RedeemPanel market={market} />}
        </aside>

        <div className="min-w-0 space-y-6 lg:col-start-1">
          <PositionCard market={market} />
          <StatusTimeline market={market} now={now} />
        </div>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading market" aria-hidden="false">
      <div aria-hidden="true">
        <div className="h-5 w-28 animate-pulse rounded-md bg-white/[0.06]" />
        <div className="mt-5 h-8 w-32 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="mt-4 h-10 max-w-[600px] animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-x-8">
          <div className="h-[300px] animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />
          <div className="h-[460px] animate-pulse rounded-3xl border border-white/10 bg-white/[0.03] lg:col-start-2 lg:row-span-2 lg:row-start-1" />
          <div className="h-[260px] animate-pulse rounded-3xl border border-white/10 bg-white/[0.03] lg:col-start-1" />
        </div>
      </div>
    </div>
  );
}
