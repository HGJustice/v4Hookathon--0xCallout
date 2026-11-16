import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { formatEth, formatRelativeTime } from "@/lib/format";
import { getMarketStatus, getOutcomeLabel, Outcome, type Market, type MarketStatus } from "@/lib/markets/market";
import OddsGauge from "./OddsGauge";
import { monoLabel } from "./styles";

/** An outcome in its own colour: YES in blush, NO in violet. */
function OutcomeWord({ outcome }: { outcome: Outcome }) {
  if (outcome === Outcome.Yes) return <span className="font-semibold text-yes">YES</span>;
  if (outcome === Outcome.No) return <span className="font-semibold text-no">NO</span>;
  return <span className="font-semibold">{getOutcomeLabel(outcome)}</span>;
}

/** What the card says once a market is past betting. */
function summary(market: Market, status: Exclude<MarketStatus, "open">): ReactNode {
  switch (status) {
    case "closed":
      return "Waiting for a result";
    case "proposed":
      return (
        <>
          Result proposed: <OutcomeWord outcome={market.proposedOutcome as Outcome} />
        </>
      );
    case "disputed":
      return "Result disputed";
    case "resolved":
      return (
        <>
          Resolved <OutcomeWord outcome={market.finalOutcome as Outcome} />
        </>
      );
  }
}

// Outlined at rest; fills with its colour on hover, so the choice reads as a real control.
const sideButton =
  "relative z-10 flex h-11 flex-1 items-center justify-between rounded-full border px-5 text-[15px] font-medium transition-[background-color,color,transform] duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2";

/** A market in the grid: the question, the chance of YES, and a way in. The whole card opens the market. */
export default function MarketTile({ market, now }: { market: Market; now: number }) {
  const status = getMarketStatus(market, BigInt(Math.floor(now / 1000)));
  const deadline = Number(market.deadline) * 1000;
  const yes = market.yesProbability === null ? null : Math.round(market.yesProbability * 100);
  const href = `/markets/${market.marketplaceID}`;
  // Open markets glow toward the side they lean to, more the more lopsided the odds are.
  const lean = status === "open" && yes !== null ? (yes >= 50 ? "yes" : "no") : undefined;
  const tintStrength = yes === null ? 0.16 : 0.16 + (Math.abs(yes - 50) / 50) * 0.14;

  return (
    <article
      className="market-card group relative flex h-full flex-col rounded-3xl border p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] transition-[border-color,box-shadow] duration-200 hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.1),0_14px_36px_-18px_rgb(var(--tint)/0.55)]"
      data-lean={lean}
      style={lean ? ({ "--tint-a": tintStrength } as CSSProperties) : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-4 pt-0.5 font-display text-[19px] leading-snug font-semibold tracking-tight text-white">
          {/* Stretched over the whole card so any click opens the market. */}
          <Link href={href} className="after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-none">
            {market.title}
          </Link>
        </h3>
        <OddsGauge yes={yes} />
      </div>

      <div className="mt-auto pt-6">
        {status === "open" ? (
          <div className="flex gap-2">
            <Link
              href={`${href}?side=yes`}
              className={`${sideButton} border-yes/50 text-yes outline-yes hover:bg-yes hover:text-black`}
            >
              Yes <span className="font-mono text-sm tabular-nums">{yes ?? "–"}%</span>
            </Link>
            <Link
              href={`${href}?side=no`}
              className={`${sideButton} border-no/50 text-no outline-no hover:bg-no hover:text-black`}
            >
              No <span className="font-mono text-sm tabular-nums">{yes === null ? "–" : 100 - yes}%</span>
            </Link>
          </div>
        ) : (
          <p className="flex h-11 items-center rounded-full bg-white/[0.06] px-5 text-[15px] font-medium text-white">
            {summary(market, status)}
          </p>
        )}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
        <div>
          <dt className={monoLabel}>At stake</dt>
          <dd className="mt-1.5 font-mono text-sm font-medium text-white tabular-nums">{formatEth(market.balance)}</dd>
        </div>
        {status !== "resolved" && (
          <div className="text-right">
            <dt className={monoLabel}>{deadline > now ? "Ends" : "Ended"}</dt>
            <dd className="mt-1.5 text-sm font-medium text-white">{formatRelativeTime(deadline, now)}</dd>
          </div>
        )}
      </dl>
    </article>
  );
}
