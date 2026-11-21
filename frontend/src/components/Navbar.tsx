"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogoMark } from "./Logo";
import ConnectWalletButton from "./wallet/ConnectWalletButton";

// The landing page's navbar: just the logo and sign-in, no links. Transparent at the very
// top, hidden while you scroll down, and back (on a dark bar) as soon as you scroll up. It
// stays put while focus is inside it, so nothing slides away mid-use.
const JITTER = 4; // ignore tiny scroll wobbles so the bar doesn't flicker

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 0);
      if (y <= 0) setHidden(false);
      else if (Math.abs(y - lastY) >= JITTER) setHidden(y > lastY);
      else return;
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-16 transition-transform duration-300 focus-within:translate-y-0 has-[[aria-expanded=true]]:translate-y-0 sm:h-20 ${hidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div
        className={`absolute inset-0 bg-background/85 backdrop-blur-md transition-opacity duration-300 ${scrolled ? "opacity-100" : "opacity-0"}`}
      />
      <nav
        aria-label="Main"
        className="relative mx-auto flex h-full max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-10 xl:px-0"
      >
        {/* Phones show the mark alone so the wallet button always fits beside it. */}
        <Link href="/" className="flex items-center gap-2.5 font-display text-base font-semibold tracking-tight sm:text-lg">
          <LogoMark className="size-8 shrink-0" />
          <span className="sr-only sm:not-sr-only">0xCallOut</span>
        </Link>
        <ConnectWalletButton />
      </nav>
    </header>
  );
}
