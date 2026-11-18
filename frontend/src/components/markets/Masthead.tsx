"use client";

import { useNow } from "@/lib/useNow";
import { appChain } from "@/lib/chain";

const dateline = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
const rowLabel = "font-mono text-[11px] tracking-[0.16em] uppercase";

/**
 * The markets page's front-page masthead: the title and motto, then a dateline strip between
 * double rules. The date is the reader's own, so it's filled in once the page is in the browser.
 */
export default function Masthead() {
  const now = useNow();
  return (
    <header className="text-center">
      <h1 id="markets-title" className="font-display text-[44px] leading-none font-black tracking-tight sm:text-7xl">The Markets</h1>
      <p className="mt-3 font-display text-base text-foreground/70 italic sm:text-lg">All the arguments fit to bet on.</p>
      <div className="mt-6 flex items-center justify-between gap-4 border-y-4 border-double border-foreground py-2">
        <span className={`${rowLabel} hidden sm:inline`}>{appChain.name} edition</span>
        {/* Holds its height before the date arrives, so nothing shifts. */}
        <span className={`${rowLabel} min-h-[1lh] flex-1 sm:flex-none`}>{now === null ? "" : dateline.format(now)}</span>
        <span className={`${rowLabel} hidden sm:inline`}>Live odds</span>
      </div>
    </header>
  );
}
