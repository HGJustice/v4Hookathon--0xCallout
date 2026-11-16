"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState, type CSSProperties } from "react";
import { formatEther } from "viem";
import { useAccount, useBalance } from "wagmi";
import { appChain } from "@/lib/chain";
import { formatAmount, formatEth, formatShares, parseEthInput } from "@/lib/format";
import { usePlaceBet, usePoolState } from "@/lib/markets/hooks";
import { Outcome, quoteBet, type Market, type Side } from "@/lib/markets/market";
import ConnectPrompt from "./ConnectPrompt";
import SidePicker from "./SidePicker";
import TxStatus from "./TxStatus";

const QUICK_AMOUNTS = ["0.01", "0.05", "0.1"];

const percent = (probability: number | null) => (probability === null ? "–" : `${Math.round(probability * 100)}%`);

/** Buy YES or NO shares in an open market, with a live quote of what the bet gets you. */
export default function TradePanel({ market }: { market: Market }) {
  const searchParams = useSearchParams();
  const [side, setSide] = useState<Side>(searchParams.get("side") === "no" ? Outcome.No : Outcome.Yes);
  const [input, setInput] = useState("");
  const { address } = useAccount();
  const balance = useBalance({ address, chainId: appChain.id });
  const pool = usePoolState(market);
  const bet = usePlaceBet();

  const amount = parseEthInput(input);
  const sideName = side === Outcome.Yes ? "YES" : "NO";
  const quote = useMemo(
    () =>
      amount && amount > 0n && pool.data
        ? quoteBet({ side, amount, reserves: pool.data.reserves, supplies: pool.data.supplies, balance: market.balance })
        : null,
    [amount, pool.data, side, market.balance],
  );
  const tooMuch = amount !== null && balance.data !== undefined && amount > balance.data.value;
  const canBuy = !!quote && !tooMuch && !bet.isPending;

  function buy() {
    if (!amount || !canBuy) return;
    bet.mutate({ marketId: market.marketplaceID, side, amount }, { onSuccess: () => setInput("") });
  }

  return (
    <div
      className="market-card rounded-3xl border p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]"
      data-lean={side === Outcome.Yes ? "yes" : "no"}
      style={{ "--tint-a": 0.2 } as CSSProperties}
    >
      <h2 className="font-display text-xl font-semibold tracking-tight">Place a bet</h2>

      <div className="mt-5">
        <SidePicker value={side} onChange={setSide} label="Side to bet on" disabled={bet.isPending} />
      </div>

      <label className="mt-5 block">
        <span className="font-mono text-[11px] tracking-[0.14em] text-white/50 uppercase">Amount</span>
        <div className="relative mt-2">
          <input
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={input}
            disabled={bet.isPending}
            onChange={(event) => {
              // Plain decimals only, up to 18 places; anything else is ignored as it's typed.
              if (event.target.value === "" || /^\d*\.?\d{0,18}$/.test(event.target.value)) setInput(event.target.value);
            }}
            className="h-14 w-full rounded-full border border-white/15 bg-white/[0.03] pr-16 pl-6 font-mono text-xl tabular-nums transition-colors placeholder:text-white/30 hover:border-white/30 focus:border-white/40 focus:outline-none disabled:opacity-60"
          />
          <span className="pointer-events-none absolute top-1/2 right-6 -translate-y-1/2 text-white/50">ETH</span>
        </div>
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((quick) => (
          <button
            key={quick}
            type="button"
            disabled={bet.isPending}
            onClick={() => setInput(quick)}
            className="h-9 rounded-full border border-white/15 px-4 font-mono text-sm text-white/70 transition-colors hover:border-white/40 hover:text-white disabled:opacity-50"
          >
            {quick}
          </button>
        ))}
        {balance.data && (
          <span className="ml-auto self-center text-sm text-white/50">
            Balance {formatAmount(formatEther(balance.data.value), "ETH")}
          </span>
        )}
      </div>

      <dl className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
        <Row label="You get" value={quote ? `${formatShares(quote.shares)} ${sideName} shares` : "–"} />
        <Row
          label={`If ${sideName} wins`}
          value={quote ? `≈ ${formatEth(quote.payoutIfWins)}` : "–"}
          hint="Changes as others bet: later bets share the pot."
        />
        <Row
          label="Chance of YES"
          value={quote ? `${percent(market.yesProbability)} → ${percent(quote.yesProbability)}` : percent(market.yesProbability)}
        />
      </dl>

      <div className="mt-6">
        {address ? (
          <button
            type="button"
            disabled={!canBuy}
            onClick={buy}
            className={`h-12 w-full rounded-full font-medium text-black transition disabled:cursor-not-allowed disabled:opacity-40 ${
              side === Outcome.Yes ? "bg-yes hover:brightness-110" : "bg-no hover:brightness-110"
            }`}
          >
            {bet.isPending ? "Placing bet…" : `Buy ${sideName}`}
          </button>
        ) : (
          <ConnectPrompt>Sign in to place a bet.</ConnectPrompt>
        )}
        <div className="mt-3 min-h-5">
          {tooMuch ? (
            <p role="alert" className="text-sm text-red-300">
              That&apos;s more than your balance.
            </p>
          ) : (
            <TxStatus
              isPending={bet.isPending}
              isSuccess={bet.isSuccess}
              error={bet.error}
              hash={bet.hash}
              success="Bet placed."
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <dt className="text-white/60">{label}</dt>
        <dd className="font-mono font-medium text-white tabular-nums">{value}</dd>
      </div>
      {hint && <p className="mt-1 text-xs text-white/50">{hint}</p>}
    </div>
  );
}
