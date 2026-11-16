import type { Metadata } from "next";
import MarketList from "@/components/markets/MarketList";

export const metadata: Metadata = {
  title: "Markets | Multiverse Markets",
  description: "Every argument that became a market. Pick a side before the deadline.",
};

// The content sits on the same opaque nebula surface as the landing page's sections. The
// page title is for screen readers and search engines; sighted users see the markets.
export default function MarketsPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section aria-label="Markets" className="surface-nebula flex-1 px-5 pt-28 pb-24 sm:px-10 sm:pt-32 2xl:px-0">
        <h1 className="sr-only">Markets</h1>
        <div className="mx-auto max-w-[1200px]">
          <MarketList />
        </div>
      </section>
    </main>
  );
}
