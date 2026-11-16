import { monoLabel } from "../styles";

/** The market's odds at full size: YES and NO as big percentages over a split bar. `yes` is 0–100, or null with no price yet. */
export default function OddsHero({ yes }: { yes: number | null }) {
  const no = yes === null ? null : 100 - yes;
  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className={monoLabel}>Yes</p>
          <p className="mt-1 font-display text-5xl leading-none font-semibold tabular-nums text-yes sm:text-6xl">
            {yes ?? "–"}%
          </p>
        </div>
        <div className="text-right">
          <p className={monoLabel}>No</p>
          <p className="mt-1 font-display text-5xl leading-none font-semibold tabular-nums text-no sm:text-6xl">
            {no ?? "–"}%
          </p>
        </div>
      </div>
      <div className="mt-5 flex h-3 gap-1 overflow-hidden rounded-full" aria-hidden="true">
        {yes === null ? (
          <span className="flex-1 rounded-full bg-white/10" />
        ) : (
          <>
            <span className="rounded-full bg-yes transition-[width] duration-300" style={{ width: `${yes}%` }} />
            <span className="flex-1 rounded-full bg-no" />
          </>
        )}
      </div>
    </div>
  );
}
