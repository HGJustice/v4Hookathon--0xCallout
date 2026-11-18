import type { ReactNode } from "react";

/** A flat block of the market page: a hairline above, a heading, then its content. */
export default function Section({ title, label, children }: { title: string; label?: string; children: ReactNode }) {
  return (
    <section aria-label={label ?? title} className="border-t border-foreground/10 pt-10">
      <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
