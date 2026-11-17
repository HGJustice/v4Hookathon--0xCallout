"use client";

import Link from "next/link";
import { useEffect } from "react";
import Notice from "@/components/markets/Notice";

// Catches anything that throws while rendering a markets page, instead of a blank screen.
export default function MarketsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col">
      <section className="surface-nebula flex-1 px-5 pt-28 pb-24 sm:px-10 sm:pt-32 2xl:px-0">
        <div className="mx-auto max-w-[720px]">
          <Notice title="Something went wrong" role="alert">
            <p>This page hit an unexpected error. Trying again usually fixes it.</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-11 items-center rounded-full bg-linear-to-r from-brand to-brand-soft px-6 font-medium text-black transition hover:brightness-110"
              >
                Try again
              </button>
              <Link
                href="/markets"
                className="inline-flex h-11 items-center rounded-full border border-white/15 px-6 text-white transition-colors hover:border-white/40"
              >
                All markets
              </Link>
            </div>
          </Notice>
        </div>
      </section>
    </main>
  );
}
