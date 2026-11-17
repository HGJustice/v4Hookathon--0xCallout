import Link from "next/link";
import { appChain } from "@/lib/chain";
import { formatEth, formatRelativeTime, shortAddress } from "@/lib/format";
import { getMarketStatus, STATUS_LABEL, type Market } from "@/lib/markets/market";
import { ArrowRight, Clock, Eth, User } from "../../icons";
import { focusRing } from "../styles";
import CopyLinkButton from "./CopyLinkButton";

const explorer = appChain.blockExplorers.default;

/** Back link and share button, the question, and a one-line summary of who made it, what's at stake and when it ends. */
export default function MarketHeader({ market, now }: { market: Market; now: number }) {
  const status = getMarketStatus(market, BigInt(Math.floor(now / 1000)));
  const deadline = Number(market.deadline) * 1000;

  return (
    <header>
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/markets"
          className={`inline-flex items-center gap-2 rounded text-sm text-white/60 transition-colors hover:text-white ${focusRing}`}
        >
          <ArrowRight className="size-4 rotate-180" /> All markets
        </Link>
        <CopyLinkButton />
      </div>

      {/* Long questions step down a size so they don't dominate the page. */}
      <h1
        className={`mt-6 font-display leading-tight font-semibold tracking-tight text-balance text-white ${
          market.title.length > 90 ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
        }`}
      >
        {market.title}
      </h1>

      <dl className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/65">
        <div>
          <dt className="sr-only">Status</dt>
          <dd
            className={`inline-flex h-7 items-center rounded-full border px-3 font-medium ${
              status === "open" ? "border-yes/50 text-yes" : "border-white/20 text-white/80"
            }`}
          >
            {STATUS_LABEL[status]}
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Created by</dt>
          <User />
          <dd>
            <a
              href={`${explorer.url}/address/${market.initializer}`}
              target="_blank"
              rel="noreferrer"
              className={`rounded font-mono transition-colors hover:text-brand ${focusRing}`}
            >
              {shortAddress(market.initializer)}
            </a>
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">At stake</dt>
          <Eth />
          <dd className="font-mono tabular-nums">{formatEth(market.balance)}</dd>
        </div>
        {status !== "resolved" && (
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Deadline</dt>
            <Clock />
            <dd>{deadline > now ? `Ends ${formatRelativeTime(deadline, now)}` : `Ended ${formatRelativeTime(deadline, now)}`}</dd>
          </div>
        )}
      </dl>
    </header>
  );
}
