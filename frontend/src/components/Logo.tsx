import { useId } from "react";

// The Multiverse Markets mark: two chrome rings, the two sides of an argument (or two
// parallel universes), whose overlap, the market, is the only part in colour.
// Drawn on a 64-unit grid; the viewBox crops to the rings so it sits tight next to text.
// The same drawing lives in src/app/icon.svg (favicon) and public/logo.svg.
const LENS = "M32 15.88A18 18 0 0 1 32 48.12A18 18 0 0 1 32 15.88Z";

export function LogoMark({ className }: { className?: string }) {
  // Gradient ids must be unique per instance (the mark appears more than once per page)
  // and safe inside url(#…), so keep only plain characters from React's id.
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const blush = `${id}-blush`;
  const steel = `${id}-steel`;

  return (
    <svg viewBox="4 4 56 56" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={blush} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe6f0" />
          <stop offset=".5" stopColor="#f6c1d3" />
          <stop offset="1" stopColor="#c98bb8" />
        </linearGradient>
        <linearGradient id={steel} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2f4f6" />
          <stop offset=".45" stopColor="#9da2aa" />
          <stop offset=".75" stopColor="#d7dbe0" />
          <stop offset="1" stopColor="#6f747c" />
        </linearGradient>
      </defs>
      <path d={LENS} fill={`url(#${blush})`} />
      <circle cx="24" cy="32" r="18" fill="none" stroke={`url(#${steel})`} strokeWidth="2.5" />
      <circle cx="40" cy="32" r="18" fill="none" stroke={`url(#${steel})`} strokeWidth="2.5" />
    </svg>
  );
}
