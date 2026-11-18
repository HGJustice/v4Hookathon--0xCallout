"use client";

import { EDITION_KEY } from "@/lib/edition";
import { Moon, Sun } from "../icons";
import { focusRing } from "../markets/styles";

/**
 * Switches the app between the day (light) and night (dark) edition. The edition lives on
 * <html data-paper="dark">, so the CSS picks the colours and which label shows; nothing
 * here needs React state. `compact` shows the icon alone (the phone's top bar).
 */
export default function EditionToggle({ compact = false }: { compact?: boolean }) {
  function toggle() {
    const root = document.documentElement;
    const night = root.dataset.paper !== "dark";
    if (night) root.dataset.paper = "dark";
    else delete root.dataset.paper;
    try {
      localStorage.setItem(EDITION_KEY, night ? "dark" : "light");
    } catch {
      // Storage blocked: the switch still works for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex items-center gap-2 rounded-xs font-mono text-[11px] tracking-[0.16em] text-foreground/70 uppercase ${
        compact ? "size-9 justify-center border border-foreground/40" : "h-8"
      } ${focusRing}`}
    >
      <Moon className="size-4 night:hidden" />
      <Sun className="hidden size-4 night:block" />
      <span className={compact ? "sr-only" : undefined}>
        <span className="night:hidden">Night edition</span>
        <span className="hidden night:inline">Day edition</span>
      </span>
    </button>
  );
}
