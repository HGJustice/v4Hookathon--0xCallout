"use client";

import { useAccount } from "wagmi";
import { formatShares } from "@/lib/format";
import { usePosition } from "@/lib/markets/hooks";
import type { Market } from "@/lib/markets/market";
import { monoLabel } from "../styles";
import Section from "./Section";

/** How many YES and NO shares the connected wallet holds. Hidden until a wallet is connected. */
export default function PositionCard({ market }: { market: Market }) {
  const { address } = useAccount();
  const position = usePosition(market);
  if (!address) return null;

  return (
    <Section title="Your position">
      {position.isPending ? (
        <div className="mt-4 h-14 animate-pulse rounded-xs bg-foreground/[0.05]" aria-hidden="true" />
      ) : !position.data ? (
        <p className="mt-3 text-[15px] text-foreground/70">
          Couldn&apos;t load your shares.{" "}
          <button type="button" onClick={() => position.refetch()} className="underline underline-offset-4 hover:text-foreground">
            Try again
          </button>
        </p>
      ) : position.data.yes === 0n && position.data.no === 0n ? (
        <p className="mt-3 text-[15px] text-foreground/70">You don&apos;t hold any shares in this market yet.</p>
      ) : (
        <dl className="mt-5 grid grid-cols-2 gap-6">
          <div>
            <dt className={monoLabel}>YES shares</dt>
            <dd className="mt-2 font-mono text-2xl font-medium tabular-nums text-yes">{formatShares(position.data.yes)}</dd>
          </div>
          <div>
            <dt className={monoLabel}>NO shares</dt>
            <dd className="mt-2 font-mono text-2xl font-medium tabular-nums text-no">{formatShares(position.data.no)}</dd>
          </div>
        </dl>
      )}
    </Section>
  );
}
