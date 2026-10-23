"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ConnectWalletButton from "./wallet/ConnectWalletButton";

const links = [
  ["Markets", "#markets"],
  ["How it works", "#how-it-works"],
  ["Use cases", "#benefits"],
  ["Docs", "#faq"],
  ["FAQ", "#faq"],
];

// Behaves like cian.app's navbar: transparent at the very top, hidden while you
// scroll down, and back (on a black bar) as soon as you scroll up. It stays put while
// focus is inside it or one of its menus is open, so nothing slides away mid-use.
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
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${scrolled ? "opacity-100" : "opacity-0"}`}
      />
      <nav className="relative mx-auto flex h-full max-w-[1200px] items-center justify-between px-5 sm:px-10 xl:px-0">
        <Link href="/" className="flex items-center gap-2.5 text-base font-medium sm:text-lg">
          <span className="size-8 rounded-full bg-linear-to-br from-brand to-brand-soft" />
          Multiverse Markets
        </Link>

        <ul className="hidden gap-10 lg:flex">
          {links.map(([label, href]) => (
            <li key={label}>
              <a href={href} className="transition-colors hover:text-brand">
                {label}
              </a>
            </li>
          ))}
        </ul>

        <ConnectWalletButton />
      </nav>
    </header>
  );
}
