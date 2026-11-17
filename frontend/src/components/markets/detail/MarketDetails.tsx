import { appChain } from "@/lib/chain";
import { formatDateTime, shortAddress } from "@/lib/format";
import type { Market } from "@/lib/markets/market";
import { ExternalLink } from "../../icons";

const explorer = appChain.blockExplorers.default;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 py-3.5">
      <dt className="text-white/60">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

function ExplorerLink({ path, children }: { path: string; children: string }) {
  return (
    <a
      href={`${explorer.url}/${path}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 font-mono transition-colors hover:text-brand"
    >
      {children} <ExternalLink className="size-3.5" />
    </a>
  );
}

/** The market's on-chain facts, one per row, each linking to the block explorer where there's something to verify. */
export default function MarketDetails({ market }: { market: Market }) {
  return (
    <section aria-label="Details">
      <h2 className="font-display text-lg font-semibold tracking-tight">Details</h2>
      <dl className="mt-2 divide-y divide-white/10 text-[15px]">
        <Row label="Market">#{market.marketplaceID.toString()}</Row>
        <Row label="Ends">{formatDateTime(Number(market.deadline) * 1000)}</Row>
        <Row label="Created by">
          <ExplorerLink path={`address/${market.initializer}`}>{shortAddress(market.initializer)}</ExplorerLink>
        </Row>
        <Row label="YES token">
          <ExplorerLink path={`address/${market.yesToken}`}>{shortAddress(market.yesToken)}</ExplorerLink>
        </Row>
        <Row label="NO token">
          <ExplorerLink path={`address/${market.noToken}`}>{shortAddress(market.noToken)}</ExplorerLink>
        </Row>
      </dl>
    </section>
  );
}
