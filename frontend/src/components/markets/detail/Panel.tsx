import type { ReactNode } from "react";
import type { Market } from "@/lib/markets/market";
import Card, { leanOf } from "./Card";

/** The card an action lives in, with a title and spaced content. */
export default function Panel({ market, title, children }: { market: Market; title: string; children: ReactNode }) {
  return (
    <Card lean={leanOf(market)}>
      <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-5">{children}</div>
    </Card>
  );
}
