import type { ReactNode } from "react";

/** A centred message in a card: nothing to show, couldn't load, not found. */
export default function Notice({ title, role, children }: { title: string; role?: "alert"; children?: ReactNode }) {
  return (
    <div role={role} className="rounded-xs border border-foreground/10 bg-foreground/[0.03] px-6 py-14 text-center">
      <p className="font-display text-2xl font-medium tracking-tight">{title}</p>
      {children && <div className="mx-auto mt-3 max-w-[460px] text-foreground/70">{children}</div>}
    </div>
  );
}
