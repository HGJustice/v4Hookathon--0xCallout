import type { Hash } from "viem";
import { appChain } from "@/lib/chain";
import { FEES } from "@/lib/protocol";
import type { marketplaceFactoryAbi } from "./generated";

/** Thrown when a transaction is mined but reverts. */
export class TransactionRevertedError extends Error {
  constructor(readonly hash: Hash) {
    super(`Transaction ${hash} reverted.`);
    this.name = "TransactionRevertedError";
  }
}

/** Thrown when the wallet cancelled the transaction, or replaced it with a different one. */
export class TransactionReplacedError extends Error {
  constructor(
    readonly hash: Hash,
    readonly reason: "cancelled" | "replaced",
  ) {
    super(`Transaction ${hash} was ${reason} in the wallet.`);
    this.name = "TransactionReplacedError";
  }
}

/** Thrown before sending when a new market's deadline is invalid; the message is user-facing. */
export class InvalidDeadlineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDeadlineError";
  }
}

type FactoryErrorName = Extract<(typeof marketplaceFactoryAbi)[number], { type: "error" }>["name"];

// One message per custom error in the ABI. Typed as a full Record so that regenerating
// the ABI with a new error fails type-checking until it has a message here.
const CONTRACT_ERRORS: Record<FactoryErrorName, string> = {
  InsufficientSetupFee: `Creating a market takes at least ${FEES.marketSetup} ETH.`,
  TitleNotLongEnough: "The question needs at least 10 characters.",
  InvalidMarketplaceID: "This market doesn't exist.",
  InsufficientBetAmount: "Enter an amount to bet.",
  MarketEnded: "This market is resolved, so it no longer takes bets.",
  InsufficientProposeFee: `Proposing or disputing an outcome takes ${FEES.outcome} ETH.`,
  MarketStillUnresolved: "No outcome has been proposed yet, so there's nothing to dispute.",
  MarketUnresolved: "This market isn't resolved yet.",
  NoTokensToRedeem: "You have no winning shares to redeem.",
  RedeemETHFailed: "Your wallet couldn't receive the payout.",
  OnlyOwnerAccess: "Only the protocol owner can do this.",
  OnlyChainlinkCreAccess: "Only the resolver can finalise an undisputed market.",
  OnlyMultiSigAccess: "Only the multisig can finalise a disputed market.",
  MarketplaceResolved: "This market is already resolved.",
  MarketplaceDisputed: "This outcome is disputed. The multisig will decide it.",
  CannotBeUnresolved: "Choose YES or NO.",
  MarketplaceAlreadyProposed: "An outcome has already been proposed for this market.",
  MarketplaceAlreadyDisputed: "This outcome has already been disputed.",
  DisputedOutcomeCannotBeProposed: "A dispute has to name a different outcome from the one proposed.",
  NotPoolManager: "Unexpected contract error. Please try again.",
};

const isContractError = (name: string): name is FactoryErrorName => Object.hasOwn(CONTRACT_ERRORS, name);

type ErrorLike = Error & { code?: unknown; shortMessage?: string; data?: { errorName?: string } };

/** The error and its causes, outermost first (viem and wagmi wrap errors in `cause`). */
function causeChain(error: unknown): ErrorLike[] {
  const chain: ErrorLike[] = [];
  for (let cause = error; cause instanceof Error && chain.length < 10; cause = cause.cause) {
    chain.push(cause as ErrorLike);
  }
  return chain;
}

/**
 * A short message for showing a failed read or transaction to the user. Errors are matched
 * by `name` rather than `instanceof`, so it still works if a wallet SDK bundles its own
 * copy of viem (whose error classes would fail an instanceof check against ours).
 */
export function getErrorMessage(error: unknown): string {
  const chain = causeChain(error);
  const find = (name: string) => chain.find((cause) => cause.name === name);

  if (chain.some((cause) => cause.name === "UserRejectedRequestError" || cause.code === 4001)) {
    return "You cancelled the transaction.";
  }

  const reverted = find("ContractFunctionRevertedError");
  const errorName = reverted?.data?.errorName;
  if (errorName && isContractError(errorName)) return CONTRACT_ERRORS[errorName];

  // String names, not `Class.name`: minification renames classes but not these strings.
  const replaced = find("TransactionReplacedError") as TransactionReplacedError | undefined;
  if (replaced) {
    return replaced.reason === "cancelled"
      ? "You cancelled the transaction."
      : "The transaction was replaced in your wallet, so it didn't go through.";
  }
  if (find("TransactionRevertedError")) {
    return "The transaction failed on-chain. No funds moved; only the network fee was spent.";
  }
  const unavailable = find("MarketsUnavailableError");
  if (unavailable) return unavailable.message;
  if (find("ConnectorNotConnectedError")) return "Connect a wallet first.";
  if (find("InsufficientFundsError")) return "Not enough ETH to cover this and the network fee.";
  if (find("ChainMismatchError")) return `Switch your wallet to ${appChain.name} and try again.`;
  if (find("ContractFunctionZeroDataError")) return `The markets contract wasn't found on ${appChain.name}.`;
  // A revert this ABI can't decode: an error from the Uniswap pool or a token, or a panic.
  if (reverted) return "The contract rejected this transaction.";

  const [outer] = chain;
  return outer?.shortMessage || outer?.message || "Something went wrong. Please try again.";
}
