// A trading-floor style strip of live odds under the navbar. Demo data: question,
// YES price in cents, and the 24h move in cents. Two identical lists scroll end to end
// (styles in globals.css); the copy is hidden from assistive tech.
const MARKETS: [question: string, yes: number, move: number][] = [
  ["Will ETH hit $10k in 2026?", 41, 3],
  ["Does 1+1=3?", 34, -2],
  ["Is a hot dog a sandwich?", 22, -5],
  ["Will BTC close 2026 above $150k?", 63, 2],
  ["Does pineapple belong on pizza?", 47, 1],
  ["Will Base flip Solana in daily txs by June?", 58, 4],
];

function TickerList({ hidden }: { hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden} className="ticker-track flex shrink-0 items-center gap-10 pr-10">
      {MARKETS.map(([question, yes, move]) => (
        <li key={question} className="flex items-center gap-3 font-mono text-xs whitespace-nowrap sm:text-[13px]">
          <span className="text-white/70">{question}</span>
          <span className="text-yes">YES {yes}¢</span>
          <span className={move > 0 ? "text-emerald-300/80" : "text-rose-300/80"}>
            {move > 0 ? "▲" : "▼"} {Math.abs(move)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function MarketTicker() {
  return (
    <section
      aria-label="Trending markets (demo)"
      className="ticker relative mt-16 flex h-10 items-center overflow-hidden border-y border-white/10 bg-white/[0.02] sm:mt-20 sm:h-11"
    >
      <p className="relative z-10 flex h-full shrink-0 items-center gap-2 border-r border-white/10 bg-background px-4 font-mono text-[10px] tracking-[0.18em] text-white/60 uppercase sm:px-6 sm:text-[11px]">
        <span className="size-1.5 rounded-full bg-yes" aria-hidden="true" />
        Trending
      </p>
      <div className="flex min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <TickerList />
        <TickerList hidden />
      </div>
    </section>
  );
}
