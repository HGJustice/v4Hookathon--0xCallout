import type { Metadata } from "next";
import MarketList from "@/components/markets/MarketList";

export const metadata: Metadata = {
  title: "Markets | 0xCallOut",
  description: "Every argument that became a market. Pick a side before the deadline.",
};

// The page title is for screen readers and search engines; sighted users see the markets.
export default function MarketsPage() {
  return (
    <section aria-label="Markets">
      <h1 className="sr-only">Markets</h1>
      <MarketList />
    </section>
  );
}
