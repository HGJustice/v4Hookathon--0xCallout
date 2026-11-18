import type { Metadata } from "next";
import { Suspense } from "react";
import CreateMarketForm from "@/components/markets/create/CreateMarketForm";

export const metadata: Metadata = {
  title: "Create a market | 0xCallOut",
  description: "Ask a question that resolves YES or NO and let anyone bet on the answer.",
};

// The form reads `?title=` and `?deadline=` in the browser, so it sits inside Suspense and
// the rest of the page stays static.
export default function CreateMarketPage() {
  return (
    <div className="mx-auto w-full max-w-[720px]">
      <h1 className="font-display text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">Create a market</h1>
      <p className="mt-3 text-foreground/70">Ask a question that ends in YES or NO. Anyone can then bet on the answer.</p>
      <Suspense fallback={null}>
        <CreateMarketForm />
      </Suspense>
    </div>
  );
}
