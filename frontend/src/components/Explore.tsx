import type { ReactNode } from "react";
import MarketCard from "./MarketCard";
import SectionTitle from "./SectionTitle";
import { ArrowRight } from "./icons";

const Highlight = ({ children }: { children: ReactNode }) => <span className="text-yes">{children}</span>;

// Full-bleed section on the nebula surface: a zooming sticky title that this section
// slides over, then a two-column row. This section answers "why"; How it works (next)
// owns the step-by-step flow. The example market is the same one as the hero's timeline.
export default function Explore() {
  return (
    <section id="markets" className="relative">
      <SectionTitle>Explore Multiverse Markets</SectionTitle>

      {/* Desktop: exactly fills the area under the navbar (h-16 / sm:h-20) with balanced
          columns. Below xl the columns stack and the section flows to its natural height. */}
      <div className="surface-nebula relative w-full border-t border-white/10 px-5 sm:px-10 2xl:px-0">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-12 py-16 xl:min-h-[calc(100svh-5rem)] xl:flex-row xl:items-center xl:gap-0 xl:py-12">
          <div className="xl:w-1/2 xl:pr-16">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] tracking-[0.18em] text-white/70 uppercase">
              <span className="size-1.5 rounded-full bg-yes" aria-hidden="true" />
              Prediction markets
            </p>
            <h3 className="mt-6 font-display text-4xl leading-tight font-medium tracking-tight sm:text-[56px] sm:leading-[62px]">
              Permissionless,
              <br />
              Turnkey,
              <br />
              <span className="bg-linear-to-r from-yes to-no bg-clip-text text-transparent">On-chain.</span>
            </h3>
            <div className="mt-8 max-w-[520px] space-y-4 text-lg leading-8 text-white/65">
              <p>
                Polymarket and Kalshi decide which questions get a market, so{" "}
                <Highlight>the arguments people actually have</Highlight> never make the cut.
              </p>
              <p>
                Here, <Highlight>any argument</Highlight> can become a market. No listing process and no
                approval, just a question, a stake and a deadline.
              </p>
              <p>
                Both sides put real money behind their claim, so{" "}
                <Highlight>the odds actually mean something.</Highlight> It&apos;s what the crowd will bet on,
                not what it says.
              </p>
            </div>
            <a
              href="#how-it-works"
              className="mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-linear-to-r from-brand to-brand-soft px-7 text-black transition hover:brightness-110"
            >
              Create yours <ArrowRight />
            </a>
          </div>

          <div className="xl:w-1/2 xl:pl-16">
            <MarketCard />
          </div>
        </div>
      </div>
    </section>
  );
}
