import Link from "next/link";
import type { ReactNode } from "react";
import { focusRing } from "../markets/styles";
import ConnectWalletButton from "../wallet/ConnectWalletButton";
import EditionToggle from "./EditionToggle";
import NavItems from "./NavItems";

/** The paper's nameplate: the name set in the headline face, like a newspaper's masthead. */
function Nameplate({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`rounded-xs font-display font-black tracking-tight ${focusRing} ${className}`}>
      0xCallOut
    </Link>
  );
}

/**
 * The frame around every app page, printed in the newspaper theme (.theme-paper), with no
 * top navbar. Wide screens get a sidebar (nameplate, sections, and the wallet at the
 * bottom); phones get a slim bar with the nameplate and wallet, and the sections as tabs
 * along the bottom.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="theme-paper relative flex flex-1 flex-col bg-background lg:pl-60">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-foreground bg-background px-6 py-7 lg:flex">
        <Nameplate className="self-start text-[28px] leading-none" />
        <p className="mt-2 font-mono text-[10px] tracking-[0.18em] text-foreground/70 uppercase">Prediction markets</p>
        <nav aria-label="Main" className="mt-8 border-t border-foreground pt-5">
          <p className="mb-3 font-mono text-[10px] tracking-[0.18em] text-foreground/70 uppercase">Sections</p>
          <NavItems variant="sidebar" />
        </nav>
        <div className="mt-auto space-y-4 border-t border-foreground/25 pt-5">
          <EditionToggle />
          <ConnectWalletButton menuPlacement="above" />
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-foreground bg-background px-5 sm:px-8 lg:hidden">
        <Nameplate className="text-2xl" />
        <div className="flex items-center gap-2">
          <EditionToggle compact />
          <ConnectWalletButton />
        </div>
      </header>

      <main className="flex-1 px-5 pt-[88px] pb-28 sm:px-8 lg:px-12 lg:pt-10 lg:pb-16">
        <div className="mx-auto w-full max-w-[1200px]">{children}</div>
      </main>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-foreground bg-background pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <NavItems variant="tabs" />
      </nav>
    </div>
  );
}
