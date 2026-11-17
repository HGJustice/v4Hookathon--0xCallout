import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import MarketDetail, { DetailSkeleton } from "@/components/markets/detail/MarketDetail";

export const metadata: Metadata = {
  title: "Market | Multiverse Markets",
  description: "Odds, progress and what you can do with this market.",
};

// The id is only known per request, so it's read inside Suspense: the page is a static
// shell and the market itself loads in the browser. Ids are positive whole numbers.
export default function MarketPage({ params }: PageProps<"/markets/[id]">) {
  return (
    <main className="flex flex-1 flex-col">
      <section className="surface-nebula flex-1 px-5 pt-28 pb-24 sm:px-10 sm:pt-32 2xl:px-0">
        <div className="mx-auto max-w-[1200px]">
          <Suspense fallback={<DetailSkeleton />}>
            {params.then(({ id }) => {
              if (!/^[1-9]\d{0,17}$/.test(id)) notFound();
              return <MarketDetail id={id} />;
            })}
          </Suspense>
        </div>
      </section>
    </main>
  );
}
