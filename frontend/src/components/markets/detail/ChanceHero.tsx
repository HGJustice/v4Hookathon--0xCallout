import { ArrowDown, ArrowUp } from "../../icons";
import { getOutcomeLabel, Outcome, type Market, type Side } from "@/lib/markets/market";
import { focusRing } from "../styles";

/**
 * The market's odds as one huge number over a split bar, and, while betting is open, the two
 * big buttons that start a bet. Choosing a side again closes it.
 */
export default function ChanceHero({
  market,
  canBet,
  result,
  side,
  onSide,
}: {
  market: Market;
  canBet: boolean;
  /** The final outcome once the market is resolved; null while it is still undecided. */
  result: number | null;
  side: Side | null;
  onSide: (side: Side | null) => void;
}) {
  const yes = market.yesProbability === null ? null : Math.round(market.yesProbability * 100);
  const no = yes === null ? null : 100 - yes;

  const buttons = [
    { value: Outcome.Yes, label: "Bet YES", Icon: ArrowUp, fill: "bg-yes" },
    { value: Outcome.No, label: "Bet NO", Icon: ArrowDown, fill: "bg-no" },
  ] as const;

  return (
    <section aria-label="Odds" className="mt-10">
      {result === null ? (
        <p className="flex items-baseline gap-3">
          <span className="font-display text-7xl leading-none font-semibold tracking-tight tabular-nums sm:text-8xl">
            {yes ?? "–"}%
          </span>
          <span className="text-xl text-white/60">chance of YES</span>
        </p>
      ) : (
        <p className="flex items-baseline gap-3">
          <span
            className={`font-display text-7xl leading-none font-semibold tracking-tight sm:text-8xl ${
              result === Outcome.Yes ? "text-yes" : result === Outcome.No ? "text-no" : ""
            }`}
          >
            {getOutcomeLabel(result)}
          </span>
          <span className="text-xl text-white/60">is the result</span>
        </p>
      )}

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
      <p className="mt-2.5 flex justify-between font-mono text-sm tabular-nums" aria-label={result === null ? "Current odds" : "Final odds"}>
        <span className="text-yes">YES {yes ?? "–"}%</span>
        <span className="text-no">NO {no ?? "–"}%</span>
      </p>

      {canBet && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {buttons.map(({ value, label, Icon, fill }) => (
            <button
              key={value}
              type="button"
              aria-pressed={side === value}
              onClick={() => onSide(side === value ? null : value)}
              className={`${fill} flex h-14 items-center justify-center gap-2 rounded-full text-base font-semibold text-black transition hover:brightness-110 active:scale-[0.98] aria-pressed:ring-2 aria-pressed:ring-white aria-pressed:ring-offset-2 aria-pressed:ring-offset-background ${focusRing}`}
            >
              {label} <Icon className="size-5" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
