"use client";

import { useState } from "react";
import SectionTitle from "./SectionTitle";

const FAQS: [question: string, answer: string][] = [
  [
    "What is Multiverse Markets?",
    "It turns online arguments into prediction markets. Any claim from a Farcaster thread can become a market, and anyone can bet on who's right.",
  ],
  [
    "How do I create a market?",
    "Tag @multiverse in the thread with the claim and the deadline, for example \"@multiverse 1+1=3, resolves Friday\". The bot replies with a link where everything is already filled in. You can also create a market directly in the mini-app. Creating one costs 0.05 ETH: a 0.01 ETH protocol fee, and the rest seeds the market.",
  ],
  [
    "When does a market go live?",
    "Right away. The creator's deposit mints equal YES and NO tokens and opens a Uniswap V4 pool at 50/50, so trading starts in the same transaction. The bot then posts the market back in the thread.",
  ],
  [
    "Can I bet if I'm not part of the argument?",
    "Yes. Anyone can buy YES or NO, with any amount of ETH. The more people bet, the better the price reflects what the crowd actually believes.",
  ],
  [
    "What do YES and NO prices mean?",
    "The price is the crowd's estimate of the probability. If YES trades at 70%, the market thinks there's a 70% chance the claim is true. YES and NO always add up to 100%.",
  ],
  [
    "Who decides the outcome?",
    "Anyone can propose the result, for a 0.05 ETH fee. If nobody disputes it, Chainlink CRE finalises it. If someone disputes it, a multisig of trusted signers reviews it and decides.",
  ],
  [
    "What if someone proposes a wrong result?",
    "Anyone can dispute it once by proposing a different result, for the same 0.05 ETH fee. The multisig then decides. Proposing and disputing both cost a fee, so neither is free to abuse.",
  ],
  [
    "What happens if I'm wrong?",
    "Your tokens for the losing side are worth nothing once the market resolves, and you lose what you put in.",
  ],
  [
    "How do winners get paid?",
    "Once the outcome is final, winners redeem their tokens and split the market's ETH in proportion to how many winning tokens each holds.",
  ],
  [
    "Which token do I need?",
    "Only ETH on Base Sepolia. You create, bet and propose in ETH, and it also pays for gas. It's a testnet, so you can get it free from a faucet.",
  ],
  ["Is it on X/Twitter?", "It's on Farcaster first. X/Twitter support is coming next."],
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative">
      <SectionTitle>Frequently asked questions</SectionTitle>

      <div className="surface-nebula relative w-full border-t border-white/10 px-5 text-white sm:px-10 2xl:px-0">
        <div className="mx-auto grid max-w-[1200px] gap-12 py-20 xl:grid-cols-[1fr_1.6fr] xl:gap-20 xl:py-28">
          <div className="xl:sticky xl:top-28 xl:self-start">
            <h3 className="font-display text-3xl font-medium tracking-tight xl:text-[40px] xl:leading-[48px]">
              Questions, answered.
            </h3>
            <p className="mt-4 max-w-[360px] text-lg leading-8 text-white/60">
              How arguments become markets, who decides the outcome, and how you get paid.
            </p>
            <a
              href="#faq"
              className="steel-border mt-8 inline-flex h-11 items-center rounded-full px-6 transition-colors hover:text-brand"
            >
              Read the docs
            </a>
          </div>

          <ul className="border-t border-white/10">
            {FAQS.map(([question, answer], i) => {
              const isOpen = open === i;
              return (
                <li key={question} className="border-b border-white/10">
                  <h4>
                    <button
                      id={`faq-question-${i}`}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg transition-colors hover:text-yes sm:text-xl"
                    >
                      {question}
                      <span
                        aria-hidden="true"
                        className={`relative size-4 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                      >
                        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white" />
                        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white" />
                      </span>
                    </button>
                  </h4>
                  {/* Height animates via grid rows 0fr → 1fr; closed answers are inert. */}
                  <div
                    id={`faq-answer-${i}`}
                    role="region"
                    aria-labelledby={`faq-question-${i}`}
                    inert={!isOpen}
                    className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-[640px] pb-6 leading-7 text-white/60">{answer}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
