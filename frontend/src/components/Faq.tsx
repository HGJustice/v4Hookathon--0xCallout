"use client";

import { useState } from "react";
import SectionTitle from "./SectionTitle";

const FAQS: [question: string, answer: string][] = [
  [
    "What is Multiverse Markets?",
    "It turns online arguments into prediction markets. When two people disagree on Farcaster, they each put money on their side, and anyone else can bet on who's right.",
  ],
  [
    "How do I create a market?",
    "Tag @multiverse in the thread with the claim, the amount and the deadline, for example \"@multiverse 1+1=3, $10 USDC each, resolves Friday\". The bot replies with a link where everything is already filled in. You can also create a market directly in the mini-app.",
  ],
  [
    "When does a market go live?",
    "Only after both people in the argument deposit their stake. Until then nothing is traded, and the bot posts the market back in the thread once it's live.",
  ],
  [
    "Can I bet if I'm not part of the argument?",
    "Yes. Once a market is live, anyone can buy YES or NO. The more people bet, the better the price reflects what the crowd actually believes.",
  ],
  [
    "What do YES and NO prices mean?",
    "The price is the crowd's estimate of the probability. If YES trades at $0.70, the market thinks there's a 70% chance the claim is true. YES + NO always adds up to $1.",
  ],
  [
    "Who decides the outcome?",
    "After the deadline, someone proposes the result and posts a bond. If nobody disputes it within the dispute window, Chainlink CRE finalises it automatically. If someone disputes it, a multisig of trusted signers reviews and decides.",
  ],
  [
    "What if someone proposes a wrong result?",
    "Anyone can dispute it by posting their own bond. The multisig then decides, and whoever was wrong loses their bond, so lying costs money.",
  ],
  [
    "What happens if I'm wrong?",
    "Your tokens for the losing side become worthless after resolution, and you lose what you put in. You can sell your position any time before the deadline to cut your losses.",
  ],
  [
    "How do winners get paid?",
    "After the outcome is final, each winning token can be redeemed for $1 USDC, minus a small protocol fee.",
  ],
  [
    "What if the other person never deposits?",
    "The market doesn't go live, and you can withdraw your deposit.",
  ],
  ["Which token do I need?", "USDC, plus a little of the network's native token for gas."],
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
