import type { ReactNode } from "react";

// Static phone frame. Shows the mini-app's bet screen by default (demo data only);
// pass children to show a different screen in the area below the status bar.
export default function PhoneMockup({ className = "", children }: { className?: string; children?: ReactNode }) {
  return (
    <div className={`w-[325px] ${className}`}>
      <div className="relative h-[656px] rounded-[58px] bg-linear-to-b from-zinc-500 via-zinc-700 to-zinc-800 p-[3px] shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
        {/* side buttons */}
        <span className="absolute -left-[2px] top-[110px] h-7 w-[3px] rounded-l bg-zinc-500" />
        <span className="absolute -left-[2px] top-[160px] h-12 w-[3px] rounded-l bg-zinc-500" />
        <span className="absolute -left-[2px] top-[220px] h-12 w-[3px] rounded-l bg-zinc-500" />
        <span className="absolute -right-[2px] top-[180px] h-20 w-[3px] rounded-r bg-zinc-500" />

        <div className="h-full rounded-[55px] bg-black p-[9px]">
          <div className="relative h-full overflow-hidden rounded-[46px] bg-[#0e0e0e] px-5 font-normal text-white">
            <div className="absolute left-1/2 top-3 h-7 w-24 -translate-x-1/2 rounded-full bg-black" />
            <div className="flex h-12 items-center justify-between px-2 text-xs font-semibold">
              <span>9:41</span>
              <span className="h-3 w-6 rounded-[4px] border border-white/60 p-px">
                <span className="block h-full w-3/4 rounded-[2px] bg-white" />
              </span>
            </div>

            <div className="relative h-[calc(100%-3rem)]">{children ?? <BetScreen />}</div>
            <span className="absolute bottom-2 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-white/60" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BetScreen() {
  return (
    <div className="pt-3">
      <p className="text-[11px] text-white/50">@dan vs @kim · Ends Friday</p>
      <p className="mt-1 text-xl font-semibold">Does 1+1=3?</p>

      <p className="mt-4 text-4xl font-semibold">
        34% <span className="text-sm font-normal text-white/50">chance YES</span>
      </p>
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="mt-2 h-16 w-full text-brand-soft">
        <path
          d="M0 15 L10 13 L20 17 L30 14 L40 19 L50 18 L60 22 L70 20 L80 23 L90 21 L100 20 V30 H0 Z"
          className="fill-brand/10"
        />
        <path
          d="M0 15 L10 13 L20 17 L30 14 L40 19 L50 18 L60 22 L70 20 L80 23 L90 21 L100 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-semibold">
        <span className="rounded-xl bg-brand py-2.5 text-center text-black">YES 34¢</span>
        <span className="rounded-xl bg-white/5 py-2.5 text-center text-white/70">NO 66¢</span>
      </div>

      <div className="mt-4 rounded-2xl bg-white/5 p-3">
        <p className="text-[11px] text-white/50">Amount</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-2xl font-semibold">$10</span>
          <span className="flex gap-1.5 text-[11px]">
            {["$5", "$25", "Max"].map((v) => (
              <span key={v} className="rounded-full bg-white/10 px-2 py-1">
                {v}
              </span>
            ))}
          </span>
        </div>
      </div>

      <p className="mt-3 flex justify-between text-xs text-white/50">
        Payout if YES <span className="text-white">$29.41</span>
      </p>
      <span className="mt-4 block rounded-2xl bg-linear-to-r from-brand to-brand-soft py-3 text-center font-semibold text-black">
        Place bet
      </span>
    </div>
  );
}
