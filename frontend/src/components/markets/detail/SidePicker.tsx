import { Outcome, type Side } from "@/lib/markets/market";
import { focusRing } from "../styles";

const OPTIONS = [
  { side: Outcome.Yes, label: "Yes", active: "border-yes bg-yes/15 text-yes" },
  { side: Outcome.No, label: "No", active: "border-no bg-no/15 text-no" },
] as const;

/** Two pills, YES and NO, one chosen. `value` is null until the user picks (for proposing and disputing). */
export default function SidePicker({
  value,
  onChange,
  label,
  disabled,
}: {
  value: Side | null;
  onChange: (side: Side) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-2 gap-2">
      {OPTIONS.map(({ side, label: text, active }) => (
        <button
          key={side}
          type="button"
          aria-pressed={value === side}
          disabled={disabled}
          onClick={() => onChange(side)}
          className={`h-11 rounded-xs border text-[15px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${focusRing} ${
            value === side ? active : "border-foreground/40 text-foreground/70 hover:border-foreground/40 hover:text-foreground"
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
