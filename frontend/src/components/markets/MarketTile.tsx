import Link from "next/link";
import type { ReactNode } from "react";
import { formatEth, formatRelativeTime } from "@/lib/format";
import { getMarketStatus, getOutcomeLabel, Outcome, type Market, type MarketStatus } from "@/lib/markets/market";

/** An outcome in its own ink: YES in green, NO in red. */
function OutcomeWord({ outcome }: { outcome: Outcome }) {
  if (outcome === Outcome.Yes) return <span className="font-semibold text-yes">YES</span>;
  if (outcome === Outcome.No) return <span className="font-semibold text-no">NO</span>;
  return <span className="font-semibold text-foreground">{getOutcomeLabel(outcome)}</span>;
}

/** The kicker above the headline: the stage, and when betting ends or ended. */
function kicker(status: MarketStatus, deadline: number, now: number): string {
  if (status === "resolved") return "Resolved";
  const when = formatRelativeTime(deadline, now);
  return status === "open" ? `Open · ends ${when}` : `Closed · ended ${when}`;
}

/** The line under the headline: the odds while it's open, then where the result stands. */
function standing(market: Market, status: MarketStatus, yes: number | null): ReactNode {
  switch (status) {
    case "open":
      return (
        <>
          <span className="text-yes">Yes {yes ?? "–"}%</span>
          <span className="text-foreground/40"> · </span>
          <span className="text-no">No {yes === null ? "–" : 100 - yes}%</span>
        </>
      );
    case "closed":
      return "Awaiting the result.";
    case "proposed":
      return (
        <>
          Result proposed: <OutcomeWord outcome={market.proposedOutcome as Outcome} />
        </>
      );
    case "disputed":
      return "The proposed result is disputed.";
    case "resolved":
      return (
        <>
          Settled <OutcomeWord outcome={market.finalOutcome as Outcome} />
        </>
      );
  }
}

/**
 * A market as a newspaper story: kicker, headline, the odds as its standfirst, and the pot
 * in the byline. The lead story (`lead`) runs a bigger headline. The whole story opens the market.
 */
export default function MarketTile({ market, now, lead = false }: { market: Market; now: number; lead?: boolean }) {
  const status = getMarketStatus(market, BigInt(Math.floor(now / 1000)));
  const yes = market.yesProbability === null ? null : Math.round(market.yesProbability * 100);

  return (
    <article className="relative flex h-full flex-col has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-foreground">
      <p className="font-mono text-[11px] tracking-[0.16em] text-foreground/70 uppercase">
        {kicker(status, Number(market.deadline) * 1000, now)}
      </p>
      <h3
        className={`mt-2 font-display font-bold text-foreground ${
          lead ? "text-[32px] leading-[1.08] sm:text-[44px]" : "line-clamp-4 text-[23px] leading-[1.15]"
        }`}
      >
        {/* Stretched over the whole story so any click opens the market. */}
        <Link href={`/markets/${market.marketplaceID}`} className="after:absolute after:inset-0 focus-visible:outline-none">
          {market.title}
        </Link>
      </h3>
      <p className={`mt-3 font-medium text-foreground/80 ${lead ? "text-lg" : "text-[15px]"}`}>{standing(market, status, yes)}</p>
      <p className="mt-auto pt-5 font-mono text-[11px] tracking-[0.16em] text-foreground/70 uppercase">
        {formatEth(market.balance)} at stake
      </p>
    </article>
  );
}
