"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/contracts/errors";
import { marketplaceFactory } from "@/lib/contracts/marketplaceFactory";
import { useMarket } from "@/lib/markets/hooks";
import { getMarketStatus, Outcome, type Market, type Side } from "@/lib/markets/market";
import { useNow } from "@/lib/useNow";
import Notice from "../Notice";
import ChanceHero from "./ChanceHero";
import MarketDetails from "./MarketDetails";
import MarketHeader from "./MarketHeader";
import PositionCard from "./PositionCard";
import { DisputedPanel, DisputePanel, ProposePanel, RedeemPanel } from "./ResolutionPanels";
import StatusTimeline from "./StatusTimeline";
import TradePanel from "./TradePanel";

/** One market on a single column: the question, the odds, whatever you can do right now, then how it resolves and the details. */
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
  // `?side=yes|no` (from the buttons on the markets list) opens the bet form straight away.
  const searchParams = useSearchParams();
  const [side, setSide] = useState<Side | null>(() => {
    const requested = searchParams.get("side");
    return requested === "yes" ? Outcome.Yes : requested === "no" ? Outcome.No : null;
  });
  const betting = status === "open";
  // Only a click moves focus into the form, so opening it from a link doesn't jump the page.
  const [focusBet, setFocusBet] = useState(false);

  // The tab, history and bookmarks name the market rather than the generic route title.
  useEffect(() => {
    document.title = `${market.title} | 0xCallOut`;
  }, [market.title]);

  return (
    <div className="mx-auto w-full max-w-[720px]">
      <MarketHeader market={market} now={now} />
      <ChanceHero
        market={market}
        canBet={betting}
        result={status === "resolved" ? market.finalOutcome : null}
        side={side}
        onSide={(next) => {
          setFocusBet(next !== null);
          setSide(next);
        }}
      />

      <div className="mt-6">
        {betting && side !== null && (
          <TradePanel key={side} market={market} side={side} autoFocus={focusBet} onClose={() => setSide(null)} />
        )}
        {status === "closed" && <ProposePanel market={market} />}
        {status === "proposed" && <DisputePanel market={market} />}
        {status === "disputed" && <DisputedPanel market={market} />}
        {status === "resolved" && <RedeemPanel market={market} />}
      </div>

      <div className="mt-12 space-y-10">
        <PositionCard market={market} />
        <StatusTimeline market={market} now={now} />
        <MarketDetails market={market} />
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading market" className="mx-auto w-full max-w-[720px]">
      <div aria-hidden="true">
        <div className="h-9 w-32 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="mt-6 h-24 animate-pulse rounded-2xl bg-white/[0.06]" />
        <div className="mt-5 h-7 w-3/4 animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="mt-10 h-20 w-56 animate-pulse rounded-2xl bg-white/[0.06]" />
        <div className="mt-6 h-3 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="h-14 animate-pulse rounded-full bg-white/[0.06]" />
          <div className="h-14 animate-pulse rounded-full bg-white/[0.06]" />
        </div>
      </div>
    </div>
  );
}
