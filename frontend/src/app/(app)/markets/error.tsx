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
    <div className="mx-auto max-w-[720px]">
      <Notice title="Something went wrong" role="alert">
        <p>This page hit an unexpected error. Trying again usually fixes it.</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center rounded-xs bg-brand px-6 font-medium text-background transition hover:brightness-110"
          >
            Try again
          </button>
          <Link
            href="/markets"
            className="inline-flex h-11 items-center rounded-xs border border-foreground/40 px-6 text-foreground transition-colors hover:border-foreground/40"
          >
            All markets
          </Link>
        </div>
      </Notice>
    </div>
  );
}
