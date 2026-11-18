import Link from "next/link";
import type { ReactNode } from "react";
import { LogoMark } from "../Logo";
import { focusRing } from "../markets/styles";
import ConnectWalletButton from "../wallet/ConnectWalletButton";
import NavItems from "./NavItems";

function Brand() {
  return (
    <Link href="/" className={`flex items-center gap-2.5 rounded font-display text-lg font-semibold tracking-tight ${focusRing}`}>
      <LogoMark className="size-8 shrink-0" />
      0xCallOut
    </Link>
  );
}

/**
 * The frame around every app page, with no top navbar. Wide screens get a sidebar (links, and
 * the wallet at the bottom); phones get a slim bar with the logo and wallet, and the links
 * as tabs along the bottom.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex flex-1 flex-col bg-background lg:pl-60">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-white/10 bg-background px-4 py-6 lg:flex">
        <div className="px-3">
          <Brand />
        </div>
        <nav aria-label="Main" className="mt-8">
          <NavItems variant="sidebar" />
        </nav>
        <div className="mt-auto px-3">
          <ConnectWalletButton menuPlacement="above" />
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-background px-5 sm:px-8 lg:hidden">
        <Brand />
        <ConnectWalletButton />
      </header>

      <main className="flex-1 px-5 pt-[88px] pb-28 sm:px-8 lg:px-10 lg:pt-12 lg:pb-16">
        <div className="mx-auto w-full max-w-[1200px]">{children}</div>
      </main>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-background pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <NavItems variant="tabs" />
      </nav>
    </div>
  );
}
