"use client";

import { useAccount } from "wagmi";
import { formatShares } from "@/lib/format";
import { usePosition } from "@/lib/markets/hooks";
import type { Market } from "@/lib/markets/market";
import { monoLabel } from "../styles";

/** How many YES and NO shares the connected wallet holds. Hidden until a wallet is connected. */
export default function PositionCard({ market }: { market: Market }) {
  const { address } = useAccount();
  const position = usePosition(market);
  if (!address) return null;

  const empty = position.data && position.data.yes === 0n && position.data.no === 0n;
  return (
    <section aria-label="Your position" className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="font-display text-lg font-semibold tracking-tight">Your position</h2>
      {position.isPending ? (
        <div className="mt-4 h-12 animate-pulse rounded-2xl bg-white/[0.05]" aria-hidden="true" />
      ) : position.isError ? (
        <p className="mt-3 text-sm text-white/60">Couldn&apos;t load your shares.</p>
      ) : empty ? (
        <p className="mt-3 text-sm text-white/60">You don&apos;t hold any shares in this market yet.</p>
      ) : (
        <dl className="mt-4 grid grid-cols-2 gap-6">
          <div>
            <dt className={monoLabel}>YES shares</dt>
            <dd className="mt-1.5 font-mono text-xl font-medium tabular-nums text-yes">{formatShares(position.data!.yes)}</dd>
          </div>
          <div>
            <dt className={monoLabel}>NO shares</dt>
            <dd className="mt-1.5 font-mono text-xl font-medium tabular-nums text-no">{formatShares(position.data!.no)}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}
