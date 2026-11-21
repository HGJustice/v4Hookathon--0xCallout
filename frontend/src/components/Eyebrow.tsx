import type { ReactNode } from "react";

/** The small outlined label above a page or section title, used on the landing page and the markets page. */
export default function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] tracking-[0.18em] text-white/70 uppercase">
      <span className="size-1.5 rounded-full bg-yes" aria-hidden="true" />
      {children}
    </p>
  );
}
