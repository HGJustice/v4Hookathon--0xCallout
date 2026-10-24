"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Close, Menu } from "./icons";
import { LogoMark } from "./Logo";
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
const DESKTOP = "(min-width: 1024px)"; // lg: inline links replace the menu

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

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

  // While the menu is open: close it on Escape (focus back to the button), on a tap
  // outside the header, or when the screen widens to the desktop layout.
  useEffect(() => {
    if (!menuOpen) return;
    const desktop = matchMedia(DESKTOP);
    const close = () => setMenuOpen(false);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      close();
      menuButtonRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    desktop.addEventListener("change", close);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      desktop.removeEventListener("change", close);
    };
  }, [menuOpen]);

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 h-16 transition-transform duration-300 focus-within:translate-y-0 has-[[aria-expanded=true]]:translate-y-0 sm:h-20 ${hidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${scrolled || menuOpen ? "opacity-100" : "opacity-0"}`}
      />
      <nav
        aria-label="Main"
        className="relative mx-auto flex h-full max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-10 xl:px-0"
      >
        {/* Phones show the mark alone so the wallet button always fits beside it. */}
        <Link href="/" className="flex items-center gap-2.5 text-base font-medium sm:text-lg">
          <LogoMark className="size-8 shrink-0" />
          <span className="sr-only sm:not-sr-only">Multiverse Markets</span>
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

        <div className="flex items-center gap-2 sm:gap-3">
          <ConnectWalletButton />
          <button
            ref={menuButtonRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? menuId : undefined}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex size-8 items-center justify-center rounded-full border border-white/15 transition-colors hover:border-white/40 sm:size-11 lg:hidden"
          >
            {menuOpen ? <Close className="size-4 sm:size-5" /> : <Menu className="size-4 sm:size-5" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
          className="absolute inset-x-0 top-full h-svh bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}
      {menuOpen && (
        <div
          id={menuId}
          className="absolute inset-x-0 top-full animate-fade-up border-b border-white/10 bg-black px-5 pb-8 sm:px-10 lg:hidden"
        >
          <ul className="mx-auto max-w-[1200px]">
            {links.map(([label, href]) => (
              <li key={label} className="border-b border-white/10 last:border-b-0">
                <a
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-4 text-2xl font-extralight transition-colors hover:text-brand"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
