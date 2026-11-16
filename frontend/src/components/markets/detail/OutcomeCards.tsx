import { Outcome, type Side } from "@/lib/markets/market";
import { monoLabel } from "../styles";

/**
 * Pick a universe: YES or NO as two large cards showing each side's chance, one selected.
 * `yes` is the chance of YES as a whole percentage, or null with no price yet.
 */
export default function OutcomeCards({
  value,
  onChange,
  yes,
  disabled,
}: {
  value: Side;
  onChange: (side: Side) => void;
  yes: number | null;
  disabled?: boolean;
}) {
  const options = [
    { side: Outcome.Yes, name: "Yes", percent: yes, on: "border-yes bg-yes/15 shadow-[0_0_28px_-10px_var(--color-yes)]", text: "text-yes" },
    { side: Outcome.No, name: "No", percent: yes === null ? null : 100 - yes, on: "border-no bg-no/15 shadow-[0_0_28px_-10px_var(--color-no)]", text: "text-no" },
  ] as const;

  return (
    <div role="radiogroup" aria-label="Side to bet on" className="grid grid-cols-2 gap-3">
      {options.map(({ side, name, percent, on, text }) => (
        <button
          key={side}
          type="button"
          role="radio"
          aria-checked={value === side}
          disabled={disabled}
          onClick={() => onChange(side)}
          className={`rounded-2xl border p-4 text-left transition-[background-color,border-color,box-shadow] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 disabled:cursor-not-allowed disabled:opacity-60 ${
            value === side ? on : "border-white/12 bg-white/[0.03] hover:border-white/30"
          }`}
        >
          <span className={`${monoLabel} ${value === side ? text : ""}`}>{name}</span>
          <span className={`mt-1.5 block font-display text-3xl leading-none font-semibold tabular-nums ${value === side ? text : "text-white"}`}>
            {percent ?? "–"}%
          </span>
        </button>
      ))}
    </div>
  );
}
