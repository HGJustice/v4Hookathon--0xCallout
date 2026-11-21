import Link from "next/link";
import type { ReactNode } from "react";
import { formatEth, formatRelativeTime } from "@/lib/format";
import { getMarketStatus, getOutcomeLabel, Outcome, type Market, type MarketStatus } from "@/lib/markets/market";

/** An outcome in its own ink: YES in green, NO in red. */
function OutcomeWord({ outcome }: { outcome: Outcome }) {
  if (outcome === Outcome.Yes) return <span className="font-semibold text-ink-yes">YES</span>;
  if (outcome === Outcome.No) return <span className="font-semibold text-ink-no">NO</span>;
  return <span className="font-semibold">{getOutcomeLabel(outcome)}</span>;
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
          <span className="text-ink-yes">Yes {yes ?? "–"}%</span>
          <span className="text-ink/40"> · </span>
          <span className="text-ink-no">No {yes === null ? "–" : 100 - yes}%</span>
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
          Settled <OutcomeWord outcome={market.finalOutcome as Outcome} />
        </>
      );
  }
}

/**
 * A market in the grid, printed like a newspaper clipping: kicker, headline, then odds and
 * pot under a thin rule. The whole card opens it.
 */
export default function MarketTile({ market, now }: { market: Market; now: number }) {
  const status = getMarketStatus(market, BigInt(Math.floor(now / 1000)));
  const yes = market.yesProbability === null ? null : Math.round(market.yesProbability * 100);

  return (
    <article className="paper-card relative flex h-full flex-col rounded-xs p-5 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-white/80">
      <p className="font-mono text-[11px] tracking-[0.16em] text-ink/70 uppercase">
        {kicker(status, Number(market.deadline) * 1000, now)}
      </p>
      <h3 className="mt-2 mb-6 line-clamp-3 font-serif text-[22px] leading-[1.2] font-bold lining-nums">
        {/* Stretched over the whole card so any click opens the market. */}
        <Link href={`/markets/${market.marketplaceID}`} className="after:absolute after:inset-0 focus-visible:outline-none">
          {market.title}
        </Link>
      </h3>

      <div className="mt-auto flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-ink/25 pt-3 text-sm">
        <p className="font-medium whitespace-nowrap text-ink/80">{standing(market, status, yes)}</p>
        <p className="shrink-0 font-mono text-[11px] tracking-[0.16em] text-ink/70 uppercase">{formatEth(market.balance)}</p>
      </div>
    </article>
  );
}
