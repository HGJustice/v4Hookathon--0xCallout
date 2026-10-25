// A prediction-market card in the style of the app: question, live odds bar, YES / NO
// prices and the market terms. Demo data, shared with the hero's timeline.
const MARKET = {
  question: "Will ETH hit $10k in 2026?",
  resolves: "Dec 31",
  yes: 41,
  terms: [
    ["Stakes", "$10 each"],
    ["Opened at", "50 / 50"],
    ["Resolves via", "Chainlink CRE"],
  ],
};

export default function MarketCard() {
  const no = 100 - MARKET.yes;
  return (
    <article className="steel-border rounded-3xl bg-white/[0.03] p-5 backdrop-blur sm:p-7">
      <p className="flex items-center justify-between gap-3 font-mono text-[11px] tracking-[0.18em] text-white/50 uppercase">
        <span>Demo market</span>
        <span>Resolves {MARKET.resolves}</span>
      </p>
      <h4 className="mt-4 font-display text-xl font-medium tracking-tight sm:text-2xl">{MARKET.question}</h4>

      {/* Odds bar: YES share in blush, NO share in violet. */}
      <div className="mt-6 flex items-center justify-between font-mono text-sm tabular-nums">
        <span className="text-yes">YES {MARKET.yes}%</span>
        <span className="text-no">{no}% NO</span>
      </div>
      <div className="mt-2 flex h-2 gap-1 overflow-hidden rounded-full" aria-hidden="true">
        <span className="rounded-full bg-yes" style={{ width: `${MARKET.yes}%` }} />
        <span className="flex-1 rounded-full bg-no" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 font-mono text-sm">
        <span className="flex h-12 items-center justify-between rounded-2xl border border-yes/30 bg-yes/10 px-4 text-yes">
          Buy YES <span className="tabular-nums">{MARKET.yes}¢</span>
        </span>
        <span className="flex h-12 items-center justify-between rounded-2xl border border-no/30 bg-no/10 px-4 text-no">
          Buy NO <span className="tabular-nums">{no}¢</span>
        </span>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
        {MARKET.terms.map(([label, value]) => (
          <div key={label}>
            <dt className="font-mono text-[10px] tracking-[0.14em] text-white/40 uppercase sm:text-[11px]">{label}</dt>
            <dd className="mt-1 text-sm text-white/85 sm:text-base">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
