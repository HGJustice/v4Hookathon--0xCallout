import type { Market } from "@/lib/markets/market";
import { monoLabel } from "../styles";
import Card, { leanOf } from "./Card";
import MarketFacts from "./MarketFacts";

/** The market's odds at full size, as two big percentages over a split bar, with the key facts underneath. */
export default function OddsCard({ market, now }: { market: Market; now: number }) {
  const yes = market.yesProbability === null ? null : Math.round(market.yesProbability * 100);
  const no = yes === null ? null : 100 - yes;

  return (
    <Card aria-label="Odds" lean={leanOf(market)}>
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className={monoLabel}>Yes</p>
          <p className="mt-2 font-display text-5xl leading-none font-semibold tracking-tight tabular-nums text-yes sm:text-6xl">
            {yes ?? "–"}%
          </p>
        </div>
        <div className="text-right">
          <p className={monoLabel}>No</p>
          <p className="mt-2 font-display text-5xl leading-none font-semibold tracking-tight tabular-nums text-no sm:text-6xl">
            {no ?? "–"}%
          </p>
        </div>
      </div>

      <div className="mt-6 flex h-3 gap-1 overflow-hidden rounded-full" aria-hidden="true">
        {yes === null ? (
          <span className="flex-1 rounded-full bg-white/10" />
        ) : (
          <>
            <span className="rounded-full bg-yes transition-[width] duration-300" style={{ width: `${yes}%` }} />
            <span className="flex-1 rounded-full bg-no" />
          </>
        )}
      </div>

      <MarketFacts market={market} now={now} />
    </Card>
  );
}
