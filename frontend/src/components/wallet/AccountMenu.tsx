"use client";

import { useEffect, useId, useRef, useState, type FocusEvent } from "react";
import { useExportWallet, usePrivy, useWallets, type User } from "@privy-io/react-auth";
import type { Address } from "viem";
import { useBalance } from "wagmi";
import { appChain } from "@/lib/chain";
import { formatAmount, shortAddress } from "@/lib/format";
import { Check, Copy, ExternalLink, Key, LogOut, User as UserIcon } from "../icons";
import { pill } from "./walletStyles";

/** Who the user is, in the most recognisable form available: Farcaster handle, email, address. */
function displayName(user: User | null, address: Address) {
  if (user?.farcaster?.username) return `@${user.farcaster.username}`;
  return user?.email?.address ?? user?.google?.email ?? shortAddress(address);
}

const item =
  "flex w-full items-center gap-3 rounded-item px-3 py-2.5 text-left transition-colors hover:bg-foreground/5 focus-visible:bg-foreground/5 focus-visible:outline-none";
const explorer = appChain.blockExplorers.default;

/** Where the panel opens: under the pill (navbar), or above it (a pill at the bottom of the sidebar). */
export type MenuPlacement = "below" | "above";
const PLACEMENT: Record<MenuPlacement, string> = {
  below: "top-full right-0 mt-3",
  above: "bottom-full left-0 mb-3",
};

/** Signed-in pill (avatar + name) that opens a small account panel. */
export default function AccountMenu({ address, placement = "below" }: { address: Address; placement?: MenuPlacement }) {
  const { user, logout } = usePrivy();
  const { wallets } = useWallets();
  const { exportWallet } = useExportWallet();
  const [open, setOpen] = useState(false);
  // Only shown in the panel, so only fetched while it's open.
  const { data: balance } = useBalance({ address, query: { enabled: open } });
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const name = displayName(user, address);
  const avatar = user?.farcaster?.pfp ?? undefined;
  // Only wallets Privy created can be exported; an external wallet already belongs to the user.
  const isEmbedded = wallets.some(
    (wallet) => wallet.walletClientType === "privy" && wallet.address.toLowerCase() === address.toLowerCase(),
  );

  // Close on a click outside or Escape (which also hands focus back to the pill).
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  // Tabbing out of the panel closes it too. A null relatedTarget is a mouse click that moved
  // focus nowhere (Safari and Firefox don't focus clicked buttons); the outside-click
  // handler covers that, and closing here would swallow clicks on the panel's own items.
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  };

  const copyAddress = () => {
    // navigator.clipboard only exists in secure contexts (HTTPS or localhost).
    navigator.clipboard?.writeText(address).then(
      () => setCopied(true),
      () => {}, // clipboard blocked: the address stays visible in the panel
    );
  };

  return (
    <div ref={rootRef} className="relative" onBlur={onBlur}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={`${pill} steel-border max-w-full hover:text-brand`}
      >
        <Avatar src={avatar} className="size-5 sm:size-6" />
        <span className="max-w-32 truncate sm:max-w-44">{name}</span>
      </button>

      {open && (
        <div id={panelId} className={`absolute w-72 ${PLACEMENT[placement]}`}>
          <div className="steel-border rounded-panel bg-raised p-2 text-sm shadow-(--menu-shadow)">
            <div className="flex items-center gap-3 p-3">
              <Avatar src={avatar} className="size-10" />
              <div className="min-w-0">
                <p className="truncate text-base font-normal">{name}</p>
                <p className="text-foreground/50">
                  {balance ? formatAmount(balance.formatted, balance.symbol) : "…"}{" "}
                  · {appChain.name}
                </p>
              </div>
            </div>

            <div className="mx-3 my-1 h-px bg-foreground/10" />

            <button type="button" onClick={copyAddress} className={item}>
              {copied ? <Check className="size-4 text-brand" /> : <Copy />}
              <span className="flex-1">{copied ? "Copied" : "Copy address"}</span>
              <span className="text-foreground/40">{shortAddress(address)}</span>
            </button>
            <a
              href={`${explorer.url}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className={item}
            >
              <ExternalLink />
              View on {explorer.name}
            </a>
            {isEmbedded && (
              <button type="button" onClick={() => void exportWallet({ address })} className={item}>
                <Key />
                Export wallet
              </button>
            )}

            <div className="mx-3 my-1 h-px bg-foreground/10" />

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                void logout();
              }}
              className={`${item} text-foreground/60 hover:text-foreground`}
            >
              <LogOut />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Farcaster profile picture when there is one, otherwise a user icon. */
function Avatar({ src, className }: { src?: string; className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`${className} flex shrink-0 items-center justify-center rounded-full bg-foreground/10 bg-cover bg-center text-foreground/70`}
      style={src ? { backgroundImage: `url(${JSON.stringify(src)})` } : undefined}
    >
      {!src && <UserIcon className="size-3/5" />}
    </span>
  );
}
