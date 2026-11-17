const ARC = "M 8 50 A 42 42 0 0 1 92 50";

/**
 * The chance of YES as a half-circle gauge: blush for the YES share, violet for the rest,
 * with the percentage in the hollow and a caption underneath. `yes` is a whole percentage
 * (0–100), or null when the market has no price yet.
 */
export default function OddsGauge({ yes }: { yes: number | null }) {
  return (
    <div
      className="w-[88px] shrink-0 text-center"
      role="img"
      aria-label={yes === null ? "No price yet" : `${yes}% chance of YES`}
    >
      <div className="relative">
        <svg viewBox="0 0 100 54" className="block w-full" aria-hidden="true">
          {/* pathLength=100 lets the dash lengths be read as percentages. */}
          <path d={ARC} pathLength={100} fill="none" strokeWidth="7" strokeLinecap="round" className="stroke-no/30" />
          {yes !== null && yes > 0 && (
            <path
              d={ARC}
              pathLength={100}
              fill="none"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${yes} 100`}
              className="gauge-fill stroke-yes transition-[stroke-dasharray] duration-300"
            />
          )}
        </svg>
        <p className="absolute inset-x-0 bottom-0 font-display text-[25px] leading-none font-semibold tabular-nums text-white">
          {yes === null ? "–" : `${yes}%`}
        </p>
      </div>
      <p className="mt-2 text-xs font-normal text-white/60">
        chance <span className="font-medium text-yes">YES</span>
      </p>
    </div>
  );
}
