/**
 * YES / NO odds as labels over a split bar: YES share in blush, NO share in violet.
 * `yes` is a whole percentage (0–100), or null when the market has no price yet.
 */
export default function OddsBar({ yes, className = "" }: { yes: number | null; className?: string }) {
  const no = yes === null ? null : 100 - yes;
  return (
    <div className={className}>
      <div className="flex items-center justify-between font-mono text-sm tabular-nums">
        <span className="text-yes">YES {yes ?? "–"}%</span>
        <span className="text-no">{no ?? "–"}% NO</span>
      </div>
      <div className="mt-2 flex h-2 gap-1 overflow-hidden rounded-xs" aria-hidden="true">
        {yes === null ? (
          <span className="flex-1 rounded-xs bg-foreground/10" />
        ) : (
          <>
            <span className="rounded-xs bg-yes" style={{ width: `${yes}%` }} />
            <span className="flex-1 rounded-xs bg-no" />
          </>
        )}
      </div>
    </div>
  );
}
