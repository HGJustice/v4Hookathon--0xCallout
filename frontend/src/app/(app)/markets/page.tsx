import type { Metadata } from "next";
import Masthead from "@/components/markets/Masthead";
import MarketList from "@/components/markets/MarketList";

export const metadata: Metadata = {
  title: "Markets | 0xCallOut",
  description: "Every argument that became a market. Pick a side before the deadline.",
};

export default function MarketsPage() {
  return (
    <section aria-labelledby="markets-title">
      <Masthead />
      <MarketList />
    </section>
  );
}
