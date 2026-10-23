"use client";

import { useEffect, useState } from "react";

// Demo YES-price history as SVG points (y: 0 = top, 40 = bottom).
// Swap for real testnet data later.
const XS = [0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 100];
const YS = [20, 18, 22, 19, 24, 23, 27, 25, 29, 26, 28, 27, 26.4];
const FLAT = 20;
const PRICE = 34;

const LOAD_DELAY = 900; // fake "fetching data" pause, like cian.app
const DURATION = 1200;

// 0 → 1 progress that starts after the load delay, eased out.
function useLoadProgress() {
  const [t, setT] = useState(0);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let start = 0;
    const tick = (now: number) => {
      start ||= now;
      const p = reduce ? 1 : Math.min((now - start) / DURATION, 1);
      setT(1 - (1 - p) ** 3);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => (frame = requestAnimationFrame(tick)), reduce ? 0 : LOAD_DELAY);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, []);

  return t;
}

export default function StatCard() {
  const t = useLoadProgress();
  const line = XS.map((x, i) => `${i ? "L" : "M"}${x} ${FLAT + (YS[i] - FLAT) * t}`).join(" ");

  return (
    <div className="flex h-[104px] w-full max-w-[580px] shrink-0 animate-fade-up items-center justify-between gap-4 rounded-full bg-white pl-6 pr-4 text-black [animation-delay:200ms] sm:h-[152px] sm:pl-12 sm:pr-5">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-xs text-black/50">
          <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-medium text-white">
            DEMO
          </span>
          Resolves Dec 31
        </p>
        <p className="mt-1 truncate text-sm sm:text-base">Will ETH hit $10k in 2026?</p>
        <p className="text-[28px] leading-9 tabular-nums sm:text-[40px] sm:leading-[48px]">
          {Math.round(PRICE * t)}% <span className="text-brand-deep">YES</span>
        </p>
      </div>
      <div className="flex h-[72px] w-[100px] shrink-0 items-center rounded-full bg-[#2a2a2a] px-4 sm:h-[112px] sm:w-[200px] sm:px-5">
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-12 w-full text-brand">
          <defs>
            <linearGradient id="stat-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity="0.35" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${line} V40 H0 Z`} fill="url(#stat-fill)" opacity={t} />
          <path
            d={line}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}
