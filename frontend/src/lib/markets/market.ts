import type { Address, ContractFunctionReturnType } from "viem";
import type { marketplaceFactoryAbi } from "@/lib/contracts/generated";

/** A market as stored on-chain: the return value of MarketplaceFactory.getMarket. */
export type MarketData = ContractFunctionReturnType<typeof marketplaceFactoryAbi, "view", "getMarket">;

export type Market = MarketData & {
  /** Chance of YES implied by the pool's current price, from 0 to 1. Null if it has no price. */
  yesProbability: number | null;
  /** The Uniswap v4 PoolManager that holds this market's pool. */
  poolManager: Address;
};

/** The contract's PredictionOutcome enum. */
export const Outcome = { Unresolved: 0, Yes: 1, No: 2, Void: 3 } as const;
export type Outcome = (typeof Outcome)[keyof typeof Outcome];

/**
 * An outcome in words: "YES", "NO" or "Void". Empty for Unresolved, so an undecided market
 * is never described as voided.
 */
export function getOutcomeLabel(outcome: number): string {
  return outcome === Outcome.Yes ? "YES" : outcome === Outcome.No ? "NO" : outcome === Outcome.Void ? "Void" : "";
}

/**
 * YES or NO: what a user bets on, proposes or disputes. Void is left out on purpose: the
 * contract currently pays nothing on a Void market (redeemMarket returns early), so letting
 * users propose it would lock everyone's funds. Allow it once the contract refunds Void.
 */
export type Side = typeof Outcome.Yes | typeof Outcome.No;

export type MarketStatus =
  /** Taking bets. */
  | "open"
  /** Past the deadline and waiting for someone to propose the outcome. */
  | "closed"
  /** An outcome was proposed and can still be disputed. */
  | "proposed"
  /** The proposed outcome was disputed; the multisig decides. */
  | "disputed"
  /** Final outcome set; winners can redeem. */
  | "resolved";

/** A market's stage in words, for badges. */
export const STATUS_LABEL: Record<MarketStatus, string> = {
  open: "Open",
  closed: "Awaiting result",
  proposed: "Result proposed",
  disputed: "Disputed",
  resolved: "Resolved",
};

/**
 * Where a market is in its lifecycle. The contract doesn't enforce the deadline yet,
 * so "closed" is the app's view of it rather than something the chain rejects.
 */
export function getMarketStatus(market: MarketData, nowSeconds: bigint): MarketStatus {
  if (market.resolved) return "resolved";
  if (market.outcomeDisputed) return "disputed";
  if (market.proposedOutcome !== Outcome.Unresolved) return "proposed";
  return nowSeconds >= market.deadline ? "closed" : "open";
}

/** Probabilities are kept to basis points (0.01%), plenty for display. */
const PRECISION = 10_000n;
const Q192 = 1n << 192n;

/**
 * The YES probability from a YES/NO pool's price. Uniswap prices token1 in token0 as
 * p = (sqrtPriceX96 / 2^96)^2. YES and NO add up to one outcome, so P(YES) = p / (1 + p)
 * when YES is token0, and 1 / (1 + p) when it is token1. Null for an uninitialised pool.
 */
export function getYesProbability(sqrtPriceX96: bigint, yesIsCurrency0: boolean): number | null {
  if (sqrtPriceX96 === 0n) return null;
  const priceX192 = sqrtPriceX96 * sqrtPriceX96;
  const yes = yesIsCurrency0 ? priceX192 : Q192;
  return Number((yes * PRECISION) / (priceX192 + Q192)) / Number(PRECISION);
}

/** Why `date` can't be a new market's deadline, or null if it can. */
export function getDeadlineProblem(date: Date, now = new Date()): string | null {
  if (Number.isNaN(date.getTime())) return "Pick a valid deadline.";
  if (date.getTime() <= now.getTime()) return "The deadline has to be in the future.";
  return null;
}

/** A JavaScript Date as the contract's deadline: whole seconds since the Unix epoch. */
export function toDeadline(date: Date): bigint {
  return BigInt(Math.floor(date.getTime() / 1000));
}

/** The current time in the same units as a market's deadline. */
export function nowInSeconds(): bigint {
  return toDeadline(new Date());
}

const Q96 = 1n << 96n;

export type TokenAmounts = { yes: bigint; no: bigint };

/**
 * What a pool holds, from its price and liquidity. A market's pool is one position spread
 * over the whole price range, so it behaves like a constant-product pool whose reserves
 * are x = L / √P (token0) and y = L · √P (token1).
 */
export function getPoolReserves(sqrtPriceX96: bigint, liquidity: bigint, yesIsCurrency0: boolean): TokenAmounts {
  const token0 = (liquidity * Q96) / sqrtPriceX96;
  const token1 = (liquidity * sqrtPriceX96) / Q96;
  return yesIsCurrency0 ? { yes: token0, no: token1 } : { yes: token1, no: token0 };
}

export type BetQuote = {
  /** Shares of the chosen side the bettor ends up holding. */
  shares: bigint;
  /** What those shares redeem for if their side wins, assuming nobody bets after. */
  payoutIfWins: bigint;
  /** The chance of YES once the bet has moved the price, from 0 to 1. */
  yesProbability: number | null;
};

/**
 * What a bet of `amount` ETH would do, modelled the way the contract does it: it mints
 * `amount` of both tokens, swaps the opposite side's tokens into the pool for more of the
 * chosen side (no pool fee), and hands over everything it got. Winners later split the
 * market's ETH in proportion to their shares of the winning token held outside the pool.
 */
export function quoteBet({
  side,
  amount,
  reserves,
  supplies,
  balance,
}: {
  side: Side;
  amount: bigint;
  /** The pool's current reserves. */
  reserves: TokenAmounts;
  /** Total supply of each token. */
  supplies: TokenAmounts;
  /** The market's ETH balance, before this bet. */
  balance: bigint;
}): BetQuote {
  const buyYes = side === Outcome.Yes;
  const reserveWin = buyYes ? reserves.yes : reserves.no;
  const reserveOther = buyYes ? reserves.no : reserves.yes;

  const swapOut = (reserveWin * amount) / (reserveOther + amount);
  const shares = amount + swapOut;

  const newWin = reserveWin - swapOut;
  const newOther = reserveOther + amount;
  const circulating = (buyYes ? supplies.yes : supplies.no) + amount - newWin;
  const payoutIfWins = circulating > 0n ? ((balance + amount) * shares) / circulating : 0n;

  const yesReserve = buyYes ? newWin : newOther;
  const noReserve = buyYes ? newOther : newWin;
  const total = yesReserve + noReserve;
  return {
    shares,
    payoutIfWins,
    yesProbability: total === 0n ? null : Number((noReserve * PRECISION) / total) / Number(PRECISION),
  };
}

/**
 * What a holder gets by redeeming in a resolved market: the market's ETH split by their
 * share of the winning token held outside the pool, as `redeemMarket` computes it.
 */
export function getRedeemAmount(market: MarketData, position: TokenAmounts): bigint {
  const winning =
    market.finalOutcome === Outcome.Yes ? position.yes : market.finalOutcome === Outcome.No ? position.no : 0n;
  const circulating = market.winningSupplyAtResolve - market.poolWinningBalanceAtResolve;
  return circulating > 0n ? (market.balance * winning) / circulating : 0n;
}
