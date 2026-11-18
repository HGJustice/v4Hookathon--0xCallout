// Pure helpers for reading wallet and viem errors. Kept free of app imports so `npm test`
// can load this file directly under Node.

export type ErrorLike = Error & { code?: unknown; shortMessage?: string; data?: { errorName?: string } };

/** The error and its causes, outermost first (viem and wagmi wrap errors in `cause`). */
export function causeChain(error: unknown): ErrorLike[] {
  const chain: ErrorLike[] = [];
  for (let cause = error; cause instanceof Error && chain.length < 10; cause = cause.cause) {
    chain.push(cause as ErrorLike);
  }
  return chain;
}

/** True when the user declined a wallet prompt (as opposed to the wallet failing). */
export const isUserRejection = (error: unknown) =>
  causeChain(error).some((cause) => cause.name === "UserRejectedRequestError" || cause.code === 4001);

/**
 * True when the wallet has no way to switch to the app chain: it doesn't know the chain
 * (EIP-3326's 4902, e.g. Phantom has no Arbitrum Sepolia) or can't switch at all. Other
 * failures (a prompt already open, a locked wallet, a network error) aren't this.
 */
export const isUnsupportedChain = (error: unknown) =>
  causeChain(error).some(
    (cause) =>
      cause.code === 4902 ||
      cause.name === "SwitchChainError" ||
      cause.name === "ChainNotConfiguredError" ||
      cause.name === "SwitchChainNotSupportedError",
  );
