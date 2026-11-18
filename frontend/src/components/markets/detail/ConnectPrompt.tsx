"use client";

import ConnectWalletButton from "../../wallet/ConnectWalletButton";

/** Shown in place of an action button until a wallet is connected. */
export default function ConnectPrompt({ children }: { children: string }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm text-foreground/70">{children}</p>
      <ConnectWalletButton />
    </div>
  );
}
