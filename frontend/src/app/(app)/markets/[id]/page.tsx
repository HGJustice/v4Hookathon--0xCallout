import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import MarketDetail, { DetailSkeleton } from "@/components/markets/detail/MarketDetail";

export const metadata: Metadata = {
  title: "Market | 0xCallOut",
  description: "Odds, progress and what you can do with this market.",
};

// The id is only known per request, so it's read inside Suspense: the page is a static
// shell and the market itself loads in the browser. Ids are positive whole numbers.
export default function MarketPage({ params }: PageProps<"/markets/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      {params.then(({ id }) => {
        if (!/^[1-9]\d{0,17}$/.test(id)) notFound();
        return <MarketDetail id={id} />;
      })}
    </Suspense>
  );
}
