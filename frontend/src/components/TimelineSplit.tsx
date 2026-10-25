"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

// One argument, two futures. The trunk is the question; at the fork it splits into the
// YES and NO universes. Each branch's thickness and its stream of particles follow its
// odds, and the odds count up once the lines have drawn. Demo market.
const MARKET = { question: "Will ETH hit $10k in 2026?", resolves: "Dec 31", yes: 41 };

// Geometry in a 600 × 320 viewBox. The container keeps that ratio, so the HTML labels
// (crisper than SVG text at every size) can be placed with percentages.
const W = 600;
const H = 320;
const FORK = { x: 210, y: 160 };
const YES_Y = 70;
const NO_Y = 250;
const TRUNK = `M8 ${FORK.y} H${FORK.x}`;
const branch = (y: number) =>
  `M${FORK.x} ${FORK.y} C${FORK.x + 90} ${FORK.y} ${FORK.x + 120} ${y} ${FORK.x + 240} ${y} H${W - 8}`;
const thickness = (odds: number) => 1.5 + (odds / 100) * 5;

const BRANCH_DELAY = 0.5; // s after the trunk starts drawing (trunk and branches: 1.2s each)
const FLOW_START = 1.7; // s: particles start once both branches have drawn
const FLOW_DURATION = 2.6; // s for a particle to travel fork → universe

const REDUCE = "(prefers-reduced-motion: reduce)";
const subscribe = (onChange: () => void) => {
  const query = matchMedia(REDUCE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
// false on the server, so the particles (pure decoration) only mount in the browser.
const useMotionAllowed = () => useSyncExternalStore(subscribe, () => !matchMedia(REDUCE).matches, () => false);

// 0 → 1, eased out, starting after `delay` ms; jumps straight to 1 with reduced motion.
function useCountUp(delay: number, duration: number) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const reduce = matchMedia(REDUCE).matches;
    let frame = 0;
    let start = 0;
    const tick = (now: number) => {
      start ||= now;
      const p = reduce ? 1 : Math.min((now - start) / duration, 1);
      setT(1 - (1 - p) ** 3);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => (frame = requestAnimationFrame(tick)), reduce ? 0 : delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [delay, duration]);
  return t;
}

const UNIVERSES = [
  { side: "YES", odds: MARKET.yes, y: YES_Y, color: "var(--color-yes)", particles: 2 },
  { side: "NO", odds: 100 - MARKET.yes, y: NO_Y, color: "var(--color-no)", particles: 3 },
] as const;

export default function TimelineSplit() {
  const t = useCountUp(1000, 1200);
  const motion = useMotionAllowed();

  return (
    <div className="w-full max-w-[580px] shrink-0 animate-fade-up [animation-delay:200ms]">
      <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] text-white/50 uppercase">
        <span className="rounded-full border border-white/15 px-2.5 py-1 text-white/70">Demo market</span>
        Resolves {MARKET.resolves}
      </p>
      <p className="mt-3 font-display text-xl font-medium tracking-tight sm:text-2xl">{MARKET.question}</p>

      <div className="relative mt-6 mb-8 aspect-[600/320]">
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" aria-hidden="true">
          <defs>
            {UNIVERSES.map((u) => (
              <linearGradient key={u.side} id={`tl-${u.side}`} gradientUnits="userSpaceOnUse" x1={FORK.x} x2={W}>
                <stop offset="0" stopColor="#ffffff" stopOpacity="0.75" />
                <stop offset="0.45" style={{ stopColor: u.color }} />
              </linearGradient>
            ))}
            <filter id="tl-glow" x="-10%" y="-50%" width="120%" height="200%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* Two faint orbits around the fork, echoing the two-ring logo. */}
          <g fill="none" stroke="#ffffff" strokeOpacity="0.07">
            <ellipse cx={FORK.x} cy={FORK.y} rx="150" ry="46" transform={`rotate(-14 ${FORK.x} ${FORK.y})`} />
            <ellipse cx={FORK.x} cy={FORK.y} rx="150" ry="46" transform={`rotate(14 ${FORK.x} ${FORK.y})`} />
          </g>

          <path d={TRUNK} pathLength={1} className="timeline-draw" fill="none" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1.5" />

          {UNIVERSES.map((u) => {
            const d = branch(u.y);
            const delay = { animationDelay: `${BRANCH_DELAY}s` };
            return (
              <g key={u.side} fill="none" strokeLinecap="round">
                <path d={d} pathLength={1} className="timeline-draw" style={delay} stroke={u.color} strokeWidth={thickness(u.odds) * 3} strokeOpacity="0.35" filter="url(#tl-glow)" />
                <path d={d} pathLength={1} className="timeline-draw" style={delay} stroke={`url(#tl-${u.side})`} strokeWidth={thickness(u.odds)} />
                <circle cx={W - 8} cy={u.y} r="4" fill={u.color} />
                {motion &&
                  Array.from({ length: u.particles }, (_, i) => {
                    const begin = `${FLOW_START + (i * FLOW_DURATION) / u.particles}s`;
                    return (
                      <circle key={i} r="2.2" fill={u.color} opacity="0">
                        <animateMotion path={d} dur={`${FLOW_DURATION}s`} begin={begin} repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur={`${FLOW_DURATION}s`} begin={begin} repeatCount="indefinite" />
                      </circle>
                    );
                  })}
              </g>
            );
          })}

          {/* The fork: where the argument is now, before either future is real. */}
          <circle cx={FORK.x} cy={FORK.y} r="5" fill="#ffffff" className="timeline-pulse" />
          <circle cx={FORK.x} cy={FORK.y} r="5" fill="#ffffff" />
        </svg>

        <p
          className="absolute -translate-x-1/2 font-mono text-[10px] tracking-[0.18em] text-white/40 uppercase"
          style={{ left: `${(FORK.x / W) * 100}%`, top: `calc(${(FORK.y / H) * 100}% + 14px)` }}
        >
          Now
        </p>

        {UNIVERSES.map((u) => (
          <div
            key={u.side}
            className="absolute right-0 text-right"
            style={
              u.side === "YES"
                ? { bottom: `calc(${(1 - u.y / H) * 100}% + 12px)` }
                : { top: `calc(${(u.y / H) * 100}% + 12px)` }
            }
          >
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase sm:text-[11px]" style={{ color: u.color }}>
              {u.side} universe
            </p>
            <p className="mt-1 font-mono text-2xl leading-none tracking-tight tabular-nums sm:text-[34px]">
              {Math.round(u.odds * t)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
