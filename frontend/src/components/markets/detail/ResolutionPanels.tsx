"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { formatEth, formatShares } from "@/lib/format";
import { useDisputeOutcome, usePosition, useProposeOutcome, useRedeem } from "@/lib/markets/hooks";
import { getOutcomeLabel, getRedeemAmount, Outcome, type Market, type Side } from "@/lib/markets/market";
import { FEES } from "@/lib/protocol";
import ConnectPrompt from "./ConnectPrompt";
import Panel from "./Panel";
import SidePicker from "./SidePicker";
import TxStatus from "./TxStatus";

const body = "text-[15px] leading-7 text-white/70";

const primaryButton =
  "h-12 w-full rounded-full bg-linear-to-r from-brand to-brand-soft font-medium text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40";

/** After the deadline, before anyone has said how it ended: propose the result. */
export function ProposePanel({ market }: { market: Market }) {
  const { address } = useAccount();
  const [outcome, setOutcome] = useState<Side | null>(null);
  const propose = useProposeOutcome();

  return (
    <Panel market={market} title="Propose the result">
      <p className={body}>
        The deadline has passed. Anyone can propose how this market ended; proposing costs {FEES.outcome} ETH, paid to
        the protocol.
      </p>
      <SidePicker
        value={outcome}
        onChange={(next) => {
          if (!propose.isIdle) propose.reset();
          setOutcome(next);
        }}
        label="Outcome to propose"
        disabled={propose.isPending}
      />
      {address ? (
        <button
          type="button"
          disabled={outcome === null || propose.isPending}
          onClick={() => outcome && propose.mutate({ marketId: market.marketplaceID, outcome })}
          className={primaryButton}
        >
          {propose.isPending ? "Proposing…" : outcome ? `Propose ${getOutcomeLabel(outcome)}` : "Choose an outcome"}
        </button>
      ) : (
        <ConnectPrompt>Sign in to propose a result.</ConnectPrompt>
      )}
      <TxStatus
        isPending={propose.isPending}
        isSuccess={propose.isSuccess}
        error={propose.error}
        hash={propose.hash}
        success="Result proposed."
      />
    </Panel>
  );
}

/** A result has been proposed: anyone who thinks it's wrong can dispute it. */
export function DisputePanel({ market }: { market: Market }) {
  const { address } = useAccount();
  const proposed = market.proposedOutcome;
  // Disputing means naming the other outcome. Only a proposed Void leaves a real choice.
  const opposite: Side | null = proposed === Outcome.Yes ? Outcome.No : proposed === Outcome.No ? Outcome.Yes : null;
  const [picked, setPicked] = useState<Side | null>(null);
  const outcome = opposite ?? picked;
  const dispute = useDisputeOutcome();

  return (
    <Panel market={market} title={`Proposed result: ${getOutcomeLabel(proposed)}`}>
      <p className={body}>
        If nobody disputes it, the resolver finalises this result and winners can redeem. If you think it&apos;s wrong,
        dispute it for {FEES.outcome} ETH (paid to the protocol) and the multisig decides.
      </p>
      {opposite === null && (
        <SidePicker
          value={picked}
          onChange={(next) => {
            if (!dispute.isIdle) dispute.reset();
            setPicked(next);
          }}
          label="Outcome to dispute with"
          disabled={dispute.isPending}
        />
      )}
      {address ? (
        <button
          type="button"
          disabled={outcome === null || dispute.isPending}
          onClick={() => outcome && dispute.mutate({ marketId: market.marketplaceID, outcome })}
          className="h-12 w-full rounded-full border border-white/25 font-medium text-white transition-colors hover:border-white/50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {dispute.isPending ? "Disputing…" : outcome ? `Dispute: it was ${getOutcomeLabel(outcome)}` : "Choose an outcome"}
        </button>
      ) : (
        <ConnectPrompt>Sign in to dispute this result.</ConnectPrompt>
      )}
      <TxStatus
        isPending={dispute.isPending}
        isSuccess={dispute.isSuccess}
        error={dispute.error}
        hash={dispute.hash}
        success="Dispute submitted."
      />
    </Panel>
  );
}

/** Disputed: nothing for users to do until the multisig rules. */
export function DisputedPanel({ market }: { market: Market }) {
  return (
    <Panel market={market} title="Result disputed">
      <p className={body}>
        {getOutcomeLabel(market.proposedOutcome)} was proposed and then disputed with {getOutcomeLabel(market.disputedOutcome)}.
        The multisig will decide, and winners can redeem once it has.
      </p>
    </Panel>
  );
}

/** Resolved: winners swap their shares for their cut of the market's ETH. */
export function RedeemPanel({ market }: { market: Market }) {
  const { address } = useAccount();
  const position = usePosition(market);
  const redeem = useRedeem();
  const result = getOutcomeLabel(market.finalOutcome);

  if (market.finalOutcome === Outcome.Void) {
    return (
      <Panel market={market} title="Market voided">
        <p className={body}>This market was voided, so there&apos;s nothing to redeem.</p>
      </Panel>
    );
  }

  const winningShares = position.data ? (market.finalOutcome === Outcome.Yes ? position.data.yes : position.data.no) : 0n;
  const payout = position.data ? getRedeemAmount(market, position.data) : 0n;

  return (
    <Panel market={market} title={`Resolved: ${result}`}>
      {!address ? (
        <ConnectPrompt>Sign in to see whether you have winnings to redeem.</ConnectPrompt>
      ) : position.isPending ? (
        <p className={body}>Checking your position…</p>
      ) : !position.data ? (
        <p role="alert" className="text-sm text-red-300">
          Couldn&apos;t load your shares.{" "}
          <button type="button" onClick={() => position.refetch()} className="underline underline-offset-4 hover:text-white">
            Try again
          </button>
        </p>
      ) : winningShares === 0n ? (
        // Right after redeeming there's nothing left, and the status below says why.
        redeem.isSuccess ? null : <p className={body}>You hold no {result} shares, so there&apos;s nothing to redeem.</p>
      ) : (
        <>
          <dl className="space-y-3 text-sm">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-white/60">Your {result} shares</dt>
              <dd className="font-mono font-medium tabular-nums">{formatShares(winningShares)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-white/60">You&apos;ll receive</dt>
              <dd className="font-mono text-lg font-medium tabular-nums">{formatEth(payout)}</dd>
            </div>
          </dl>
          <button
            type="button"
            disabled={redeem.isPending}
            onClick={() => redeem.mutate({ marketId: market.marketplaceID })}
            className={primaryButton}
          >
            {redeem.isPending ? "Redeeming…" : "Redeem winnings"}
          </button>
        </>
      )}
      <TxStatus
        isPending={redeem.isPending}
        isSuccess={redeem.isSuccess}
        error={redeem.error}
        hash={redeem.hash}
        success="Winnings sent to your wallet."
      />
    </Panel>
  );
}
