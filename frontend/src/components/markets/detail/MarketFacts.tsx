import { appChain } from "@/lib/chain";
import { formatDateTime, formatEth, shortAddress } from "@/lib/format";
import type { Market } from "@/lib/markets/market";
import { ExternalLink } from "../../icons";
import { monoLabel } from "../styles";

const explorer = appChain.blockExplorers.default;

function ExplorerLink({ path, children }: { path: string; children: string }) {
  return (
    <a
      href={`${explorer.url}/${path}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 transition-colors hover:text-brand"
    >
      {children} <ExternalLink className="size-3.5" />
    </a>
  );
}

/** The market's key numbers and where to verify them on-chain, as a strip along the bottom of the odds stage. */
export default function MarketFacts({ market, now }: { market: Market; now: number }) {
  const deadline = Number(market.deadline) * 1000;
  return (
    <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-6 xl:grid-cols-4">
      <div>
        <dt className={monoLabel}>At stake</dt>
        <dd className="mt-1.5 font-mono text-[15px] font-medium tabular-nums">{formatEth(market.balance)}</dd>
      </div>
      <div>
        <dt className={monoLabel}>{deadline > now ? "Ends" : "Ended"}</dt>
        <dd className="mt-1.5 text-[15px] font-medium">{formatDateTime(deadline)}</dd>
      </div>
      <div>
        <dt className={monoLabel}>Created by</dt>
        <dd className="mt-1.5 font-mono text-[15px]">
          <ExplorerLink path={`address/${market.initializer}`}>{shortAddress(market.initializer)}</ExplorerLink>
        </dd>
      </div>
      <div>
        <dt className={monoLabel}>Tokens</dt>
        <dd className="mt-1.5 flex gap-4 text-[15px]">
          <ExplorerLink path={`address/${market.yesToken}`}>YES</ExplorerLink>
          <ExplorerLink path={`address/${market.noToken}`}>NO</ExplorerLink>
        </dd>
      </div>
    </dl>
  );
}
