import type { ReactNode } from "react";
import SectionTitle from "./SectionTitle";
import { ArrowRight } from "./icons";

const Highlight = ({ children }: { children: ReactNode }) => (
  <span className="text-brand-deep">{children}</span>
);

// Same market as the hero's stat card; "Does 1+1=3?" stays How it works' running story.
const EXAMPLE = {
  question: "Will ETH hit $10k in 2026?",
  details: [
    ["Stakes", "$10 each"],
    ["Starting odds", "50% / 50%"],
    ["Resolves via", "Chainlink CRE"],
  ],
};

// Full-bleed light section, laid out like cian.app's product block:
// a zooming sticky title that this section slides over, then a two-column row.
// This section answers "why"; How it works (next) owns the step-by-step flow.
export default function Explore() {
  return (
    <section id="markets" className="relative">
      <SectionTitle>Explore Multiverse Markets</SectionTitle>

      {/* Desktop: exactly fills the area under the navbar (h-16 / sm:h-20) with balanced
          columns. Below xl the columns stack and the section flows to its natural height. */}
      <div className="relative w-full bg-linear-to-br from-[#fff8fb] via-[#fcedf2] to-[#f5dbe5] px-5 text-black sm:px-10 2xl:px-0">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-10 py-14 xl:min-h-[calc(100svh-5rem)] xl:flex-row xl:items-center xl:gap-0 xl:py-12">
          <div className="xl:w-1/2 xl:pr-16">
            <p className="inline-block rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
              Prediction markets
            </p>
            <h3 className="mt-6 text-4xl font-extralight leading-tight sm:text-[56px] sm:leading-[64px]">
              Permissionless,
              <br />
              Turnkey,
              <br />
              <Highlight>On-chain.</Highlight>
            </h3>
            <a
              href="#how-it-works"
              className="mt-10 inline-flex h-12 items-center gap-2 rounded-full border border-black bg-black px-8 text-white transition-colors hover:bg-transparent hover:text-black sm:h-14 sm:px-10"
            >
              Create yours <ArrowRight />
            </a>
          </div>

          <div className="xl:w-1/2 xl:pl-16">
            <div className="space-y-5 text-lg leading-7 sm:text-xl sm:leading-8">
              <p>
                Polymarket and Kalshi decide which questions get a market, so{" "}
                <Highlight>the arguments people actually have</Highlight> never make the cut.
              </p>
              <p>
                Here, <Highlight>any argument</Highlight> can become a market. No listing process
                and no approval, just a question, a stake and a deadline.
              </p>
              <p>
                Both sides put real money behind their claim, so{" "}
                <Highlight>the odds actually mean something.</Highlight> It&apos;s what the crowd
                will bet on, not what it says.
              </p>
            </div>

            <p className="mt-10 text-xl sm:text-2xl">For Example</p>
            <div className="mt-4 rounded-3xl bg-white p-5 sm:p-6">
              <p className="text-lg">{EXAMPLE.question}</p>
              {/* Phones: label and value on one row each. From sm: three columns. */}
              <dl className="mt-4 divide-y divide-black/5 sm:grid sm:grid-cols-3 sm:gap-4 sm:divide-y-0">
                {EXAMPLE.details.map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between py-2.5 sm:block sm:py-0">
                    <dt className="text-sm text-black/50">{label}</dt>
                    <dd className="text-base sm:mt-1 sm:text-lg">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
