import {
  isAddressEqual,
  parseEther,
  parseEventLogs,
  type ContractFunctionArgs,
  type ContractFunctionName,
  type Hash,
  type ReplacementReason,
  type TransactionReceipt,
} from "viem";
import type { Config } from "wagmi";
import {
  getAccount,
  getPublicClient,
  simulateContract,
  switchChain,
  writeContract,
  type SimulateContractParameters,
} from "wagmi/actions";
import { isUnsupportedChain, isUserRejection } from "@/lib/contracts/errorChain";
import {
  InvalidDeadlineError,
  TransactionReplacedError,
  TransactionRevertedError,
  UnsupportedNetworkError,
} from "@/lib/contracts/errors";
import type { marketplaceFactoryAbi } from "@/lib/contracts/generated";
import { requireMarketplaceFactory } from "@/lib/contracts/marketplaceFactory";
import { FEES } from "@/lib/protocol";
import { getDeadlineProblem, Outcome, toDeadline, type Side } from "./market";

// Every write goes through `execute`:
//   1. simulate on the app chain's RPC, so a revert (e.g. MarketplaceAlreadyProposed)
//      is caught with its reason before the wallet opens, rather than as a failed tx;
//   2. ask the wallet to switch to the app chain if it's on another one;
//   3. send the simulated request from the connected wallet;
//   4. wait for the receipt; throw if it reverted or the wallet replaced the transaction.
// `onSubmitted` fires with the hash once the wallet has sent it (and again with the new
// hash if the wallet speeds it up).

type OnSubmitted = (hash: Hash) => void;
type FactoryAbi = typeof marketplaceFactoryAbi;
type WriteFunction = ContractFunctionName<FactoryAbi, "nonpayable" | "payable">;

const outcomeFee = parseEther(FEES.outcome);

/** Creates a market seeded with `amount` (at least the setup fee). Returns its id. */
export async function createMarket(
  config: Config,
  { question, deadline, amount }: { question: string; deadline: Date; amount: bigint },
  onSubmitted?: OnSubmitted,
): Promise<{ marketId: bigint; receipt: TransactionReceipt }> {
  // The contract's own deadline check is disabled for now, so this is the only guard.
  const problem = getDeadlineProblem(deadline);
  if (problem) throw new InvalidDeadlineError(problem);

  const factory = requireMarketplaceFactory();
  const receipt = await execute(
    config,
    { functionName: "createMarket", args: [question, toDeadline(deadline)], value: amount },
    onSubmitted,
  );

  // Only the factory's own logs: a wallet that batches calls may add others to the receipt.
  const logs = receipt.logs.filter((log) => isAddressEqual(log.address, factory.address));
  const [created] = parseEventLogs({ abi: factory.abi, eventName: "MarketCreated", logs });
  if (!created) throw new Error("The market was created, but its id wasn't found in the transaction.");
  return { marketId: created.args.marketplaceID, receipt };
}

/** Bets `amount` on one side of a market. */
export function placeBet(
  config: Config,
  { marketId, side, amount }: { marketId: bigint; side: Side; amount: bigint },
  onSubmitted?: OnSubmitted,
): Promise<TransactionReceipt> {
  return execute(config, { functionName: "betMarket", args: [marketId, side === Outcome.Yes], value: amount }, onSubmitted);
}

/** Proposes how a market resolved, paying the outcome fee. */
export function proposeOutcome(
  config: Config,
  { marketId, outcome }: { marketId: bigint; outcome: Side },
  onSubmitted?: OnSubmitted,
): Promise<TransactionReceipt> {
  return execute(config, { functionName: "proposeOutcome", args: [marketId, outcome], value: outcomeFee }, onSubmitted);
}

/** Disputes the proposed outcome with a different one, paying the outcome fee. */
export function disputeOutcome(
  config: Config,
  { marketId, outcome }: { marketId: bigint; outcome: Side },
  onSubmitted?: OnSubmitted,
): Promise<TransactionReceipt> {
  return execute(config, { functionName: "disputeOutcome", args: [marketId, outcome], value: outcomeFee }, onSubmitted);
}

/** Burns the caller's winning shares in a resolved market for their share of its ETH. */
export function redeem(
  config: Config,
  { marketId }: { marketId: bigint },
  onSubmitted?: OnSubmitted,
): Promise<TransactionReceipt> {
  return execute(config, { functionName: "redeemMarket", args: [marketId] }, onSubmitted);
}

/** Simulates, switches chain if needed, sends and confirms one factory call. */
async function execute<functionName extends WriteFunction>(
  config: Config,
  call: {
    functionName: functionName;
    args: ContractFunctionArgs<FactoryAbi, "nonpayable" | "payable", functionName>;
    value?: bigint;
  },
  onSubmitted?: OnSubmitted,
): Promise<TransactionReceipt> {
  const factory = requireMarketplaceFactory();
  // `call` is fully typed by this function's signature; wagmi's generics can't follow a
  // generic functionName, so the parameters are widened to the factory's ABI here.
  const { request } = await simulateContract(config, { ...factory, ...call } as SimulateContractParameters<FactoryAbi>);
  // Embedded wallets switch silently; external ones show a single prompt. A wallet that
  // can't switch at all (Phantom has no Arbitrum Sepolia) gets a plain message; any other
  // failure, including declining the prompt, keeps its own.
  if (getAccount(config).chainId !== factory.chainId) {
    try {
      await switchChain(config, { chainId: factory.chainId });
    } catch (error) {
      throw isUnsupportedChain(error) && !isUserRejection(error) ? new UnsupportedNetworkError({ cause: error }) : error;
    }
  }
  return confirm(config, await writeContract(config, request), onSubmitted);
}

/**
 * Waits for a transaction on the app chain. Throws TransactionRevertedError if it reverted
 * (wagmi's waitForTransactionReceipt also throws, but decodes only string reasons, so a
 * custom error would come out as garbled text), and TransactionReplacedError if the wallet
 * cancelled or replaced it: viem then resolves with the replacement's receipt, which would
 * otherwise look like success.
 */
async function confirm(config: Config, hash: Hash, onSubmitted?: OnSubmitted): Promise<TransactionReceipt> {
  onSubmitted?.(hash);
  const client = getPublicClient(config, { chainId: requireMarketplaceFactory().chainId });
  if (!client) throw new Error("The app chain isn't configured in wagmi.");

  let replacement = undefined as { reason: ReplacementReason; hash: Hash } | undefined;
  const receipt = await client.waitForTransactionReceipt({
    hash,
    onReplaced: ({ reason, transaction }) => (replacement = { reason, hash: transaction.hash }),
  });
  if (replacement) {
    // "repriced" is the same call with a higher fee (a speed-up), so it still ran.
    if (replacement.reason !== "repriced") throw new TransactionReplacedError(hash, replacement.reason);
    onSubmitted?.(replacement.hash);
  }
  if (receipt.status === "reverted") throw new TransactionRevertedError(receipt.transactionHash);
  return receipt;
}
