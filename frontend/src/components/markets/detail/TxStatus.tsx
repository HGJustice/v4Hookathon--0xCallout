import type { Hash } from "viem";
import { getErrorMessage } from "@/lib/contracts/errors";
import { appChain } from "@/lib/chain";
import { ExternalLink } from "../../icons";

const explorer = appChain.blockExplorers.default;

/** The transaction hash as a link to the block explorer. */
export function TxLink({ hash, children }: { hash: Hash; children: string }) {
  return (
    <a
      href={`${explorer.url}/tx/${hash}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-brand"
    >
      {children} <ExternalLink className="size-3.5" />
    </a>
  );
}

/**
 * Where a write stands, from a mutation of useMarketWrite: waiting on the wallet, waiting
 * on the network, done, or failed with a readable reason. Renders nothing when idle.
 */
export default function TxStatus({
  isPending,
  isSuccess,
  error,
  hash,
  success,
}: {
  isPending: boolean;
  isSuccess: boolean;
  error: unknown;
  hash: Hash | undefined;
  success: string;
}) {
  if (isPending) {
    return (
      <p role="status" className="text-sm text-white/70">
        {hash ? (
          <>
            Waiting for the network… <TxLink hash={hash}>View transaction</TxLink>
          </>
        ) : (
          "Confirm in your wallet…"
        )}
      </p>
    );
  }
  if (error) {
    return (
      <p role="alert" className="text-sm text-red-300">
        {getErrorMessage(error)}
      </p>
    );
  }
  if (isSuccess) {
    return (
      <p role="status" className="text-sm text-white/80">
        {success} {hash && <TxLink hash={hash}>View transaction</TxLink>}
      </p>
    );
  }
  return null;
}
