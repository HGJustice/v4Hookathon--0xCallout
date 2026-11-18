import Link from "next/link";
import type { ReactNode } from "react";
import { formatEth, formatRelativeTime } from "@/lib/format";
import { getMarketStatus, getOutcomeLabel, Outcome, type Market, type MarketStatus } from "@/lib/markets/market";

/** An outcome in its own colour: YES in blush, NO in violet. */
function OutcomeWord({ outcome }: { outcome: Outcome }) {
  if (outcome === Outcome.Yes) return <span className="text-yes">YES</span>;
  if (outcome === Outcome.No) return <span className="text-no">NO</span>;
  return <span className="text-white">{getOutcomeLabel(outcome)}</span>;
}

/** The line above the question, like an article's kicker: the stage and when it ends. */
function kicker(status: MarketStatus, deadline: number, now: number): string {
  if (status === "resolved") return "Resolved";
  const when = formatRelativeTime(deadline, now);
  return status === "open" ? `Open · ends ${when}` : `Closed · ended ${when}`;
}

/** The line under the question: the odds while it's open, then where the result stands. */
function standing(market: Market, status: MarketStatus, yes: number | null): ReactNode {
  switch (status) {
    case "open":
      return (
        <>
          <span className="text-yes">Yes {yes ?? "–"}%</span>
          <span className="text-white/25"> · </span>
          <span className="text-no">No {yes === null ? "–" : 100 - yes}%</span>
        </>
      );
    case "closed":
      return "Awaiting result";
    case "proposed":
      return (
        <>
          Proposed: <OutcomeWord outcome={market.proposedOutcome as Outcome} />
        </>
      );
    case "disputed":
      return "Result disputed";
    case "resolved":
      return (
        <>
          Outcome: <OutcomeWord outcome={market.finalOutcome as Outcome} />
        </>
      );
  }
}

/** A market in the grid, laid out like a post: kicker, question, then odds and pot. The whole card opens it. */
export default function MarketTile({ market, now }: { market: Market; now: number }) {
  const status = getMarketStatus(market, BigInt(Math.floor(now / 1000)));
  const yes = market.yesProbability === null ? null : Math.round(market.yesProbability * 100);

  return (
    <article className="relative flex h-full flex-col rounded-lg border border-white/10 bg-white/[0.02] p-5 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-white/80">
      <p className="text-xs font-medium tracking-wide text-white/45 uppercase">
        {kicker(status, Number(market.deadline) * 1000, now)}
      </p>
      <h3 className="mt-3 mb-6 line-clamp-3 font-serif text-[21px] leading-[1.3] font-medium text-white">
        {/* Stretched over the whole card so any click opens the market. */}
        <Link href={`/markets/${market.marketplaceID}`} className="after:absolute after:inset-0 focus-visible:outline-none">
          {market.title}
        </Link>
      </h3>

      <div className="mt-auto flex items-baseline justify-between gap-4 border-t border-white/10 pt-4 text-sm">
        <p className="font-medium text-white/70">{standing(market, status, yes)}</p>
        <p className="shrink-0 font-mono text-white/50 tabular-nums">{formatEth(market.balance)}</p>
      </div>
    </article>
  );
}
