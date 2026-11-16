import type { ReactNode } from "react";

/** The card an action lives in, in the same surface as the market cards. */
export default function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="market-card rounded-3xl border p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]">
      <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-5">{children}</div>
    </div>
  );
}
