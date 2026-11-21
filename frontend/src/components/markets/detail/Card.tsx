import type { CSSProperties, HTMLAttributes } from "react";
import type { Market } from "@/lib/markets/market";

/** Which side a market leans to, for the card glow: blush for YES, violet for NO. Neutral with no price. */
export function leanOf(market: Pick<Market, "yesProbability">): "yes" | "no" | undefined {
  return market.yesProbability === null ? undefined : market.yesProbability >= 0.5 ? "yes" : "no";
}

/**
 * The one container every block on a market page lives in: the same surface, glow and edge
 * as the market cards, tinted toward `lean` so the page reads as a single set.
 */
export default function Card({
  lean,
  className = "",
  children,
  ...rest
}: { lean?: "yes" | "no" } & HTMLAttributes<HTMLElement>) {
  return (
    <section
      {...rest}
      className={`market-card rounded-3xl border p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] ${className}`}
      data-lean={lean}
      style={{ "--tint-a": 0.2 } as CSSProperties}
    >
      {children}
    </section>
  );
}
