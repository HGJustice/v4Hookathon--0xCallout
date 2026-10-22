"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import SectionTitle from "./SectionTitle";

const BENEFITS = [
  {
    image: "/benefits/tile-1.svg",
    letter: "O",
    title: "Open to Anyone",
    body: "No listing approval. Any argument, any time, no permission needed.",
    detail: "Markets start from a Farcaster post or straight from the mini-app.",
  },
  {
    image: "/benefits/tile-2.svg",
    letter: "D",
    title: "Deep Liquidity",
    body: "Both deposits seed the pool, so anyone can trade from the first second.",
    detail: "Prices open at 50/50 and move with every YES or NO trade.",
    tag: "Built on Uniswap V4 hooks",
  },
  {
    image: "/benefits/tile-3.svg",
    letter: "D",
    title: "Decentralised Resolution",
    body: "Undisputed outcomes finalise automatically. Disputed ones go to a multisig.",
    detail: "Proposing or disputing needs a bond, so lying costs money.",
    tag: "Powered by Chainlink CRE",
  },
  {
    image: "/benefits/tile-4.svg",
    letter: "S",
    title: "Settled On-chain",
    body: "Every trade and payout is public and verifiable.",
    detail: "Winning tokens redeem for the pot once the market resolves.",
  },
];

// Mirrors cian.app's "Core Protocol Benefits" deck (desktop, ≥1280px), using the
// constants from cian's own source. Each card:
//  - starts when its 45°-tilted box first enters the screen (ENTER px above the bottom),
//    parked PARK px in from the right edge of the screen;
//  - from then slides left 1px per 1px scrolled until it reaches its slot;
//  - un-tilts 45° → 0° over (viewport height / SWING) px of scroll, pivoting bottom-left;
//  - rises with the page and sticks 80px lower than the card before it.
// A pinned stage holds panel + cards. On exit, as in cian, the panel's bottom edge
// pushes the cards up one by one so the deck collapses into a single row, then leaves.
const STEP = 786.667; // scroll between cards: 308 card + 40 padding + 438.667 margin
const ENTER = 102; // 348px slot tilted 45°: its top corner sits 348·(1 − cos45°) below the top
const SWING = 0.9; // cian: rotation = 45 − scrolled · (45 / viewport height) · 0.9
const HOLD = 274; // finished deck rests this long before the stage unpins
const PARK = 0; // where waiting cards sit: px in from the screen's right edge (cian: 40)
const CARD_H = 308; // desktop card height (matches xl:h-[308px] on the card)
const CARD_GAP = 80; // each card rests this much lower than the one before
// Bottom-anchored deck: the last card's bottom edge sits on the panel's bottom edge and
// the others stack upward from it. The 96px floor keeps the first card below the navbar.
const slotTop = (i: number) =>
  `calc(max(96px, 100vh - ${CARD_H + (BENEFITS.length - 1) * CARD_GAP}px) + ${i * CARD_GAP}px)`;

export default function Benefits() {
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(min-width: 1280px) and (prefers-reduced-motion: no-preference)", () => {
        const stage = stageRef.current!;
        const cards = gsap.utils.toArray<HTMLElement>(".benefit-card", stage);
        gsap.set(cards, { transformOrigin: "0% 100%" });

        // Layout is measured once per refresh (load/resize), never while scrolling, so the
        // per-frame update below only writes. Transforms don't affect these readings.
        let rests: number[] = []; // each card's resting top inside the stage
        let travels: number[] = []; // distance from the parked spot to the card's slot
        let end = 0; // how long the stage stays pinned
        const measure = () => {
          const vh = window.innerHeight;
          const left = (cards[0].offsetParent as HTMLElement).getBoundingClientRect().left;
          rests = cards.map((card) => card.offsetTop);
          travels = cards.map((card) => window.innerWidth - PARK - left - card.offsetLeft);
          const last = cards.length - 1;
          const settle = Math.max(vh / SWING, travels[last]); // last card's slide + un-tilt
          end = last * STEP - (vh - ENTER) + settle + HOLD;
          return end;
        };

        // p = px scrolled since the stage pinned (negative while it is still rising).
        const update = (p: number) => {
          const vh = window.innerHeight;
          // stage's top on screen: rising (p < 0), pinned at 0, then scrolling away
          const stageTop = p < 0 ? -p : p > end ? end - p : 0;
          // Like cian's sticky column: no card may sit lower than "panel bottom − card
          // height". Once the panel scrolls away its bottom edge climbs, pushing the
          // lowest card first; every pushed card shares that line, so the deck ends
          // in one row before leaving with the panel.
          const floor = p > end ? stageTop + vh - CARD_H : Infinity; // only while exiting
          cards.forEach((card, i) => {
            const rest = rests[i]; // resting top (on screen, while pinned)
            const natural = i * STEP - p; // card top on screen if it simply scrolled
            const scrolled = vh - ENTER - i * STEP + p; // px since this card entered the screen
            const top = Math.min(Math.max(rest, natural), floor);
            gsap.set(card, {
              x: Math.max(0, travels[i] - Math.max(0, scrolled)),
              y: top - stageTop - rest,
              rotate: 45 * gsap.utils.clamp(0, 1, 1 - (scrolled * SWING) / vh),
            });
          });
        };

        ScrollTrigger.create({
          trigger: stage,
          start: "top top",
          end: () => `+=${measure()}`,
          pin: true,
          invalidateOnRefresh: true,
        });
        ScrollTrigger.create({
          trigger: stage,
          start: "top bottom",
          end: () => `+=${2 * window.innerHeight + end}`, // through the exit
          invalidateOnRefresh: true,
          onUpdate: (self) => update(self.scroll() - self.start - window.innerHeight),
          onRefresh: (self) => update(self.scroll() - self.start - window.innerHeight),
        });

        // The per-frame sets above happen in callbacks, which matchMedia doesn't record,
        // so clear them explicitly when the deck is switched off (narrow screen or
        // reduced motion) to leave the cards at rest.
        return () => gsap.set(cards, { clearProps: "transform" });
      });
    },
    { scope: stageRef },
  );

  return (
    <section id="benefits" className="relative">
      <SectionTitle>Why Multiverse Markets</SectionTitle>

      {/* Desktop: pinned stage with the panel and the deck of swinging cards. */}
      <div ref={stageRef} className="relative hidden h-screen overflow-hidden xl:block">
        <div className="relative mx-auto h-full max-w-[1200px]">
          <div className="panel-glow absolute inset-0 rounded-3xl" />
          {BENEFITS.map((b, i) => (
            <div
              key={b.title}
              className="benefit-card absolute will-change-transform"
              style={{ top: slotTop(i), left: 40 + i * 180 }}
            >
              <BenefitCard {...b} />
            </div>
          ))}
        </div>
      </div>

      {/* Below 1280px: the same cards, simply stacked on the panel. */}
      <div className="px-5 sm:px-10 xl:hidden">
        <div className="panel-glow mx-auto flex max-w-[1200px] flex-col gap-4 rounded-3xl p-5">
          {BENEFITS.map((b) => (
            <BenefitCard key={b.title} {...b} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitCard({ image, letter, title, body, detail, tag }: (typeof BENEFITS)[number]) {
  return (
    <article className="rounded-3xl bg-white p-5 text-black shadow-[0_10px_40px_15px_rgba(0,0,0,0.2)] xl:h-[308px] xl:w-[580px] xl:p-10">
      <h3 className="mb-3 text-2xl xl:mb-10 xl:text-[40px] xl:leading-[48px]">{title}</h3>
      <div className="flex gap-5">
        {/* Abstract steel-and-light artwork (public/benefits), with the letter on top. */}
        <span
          style={{ backgroundImage: `url(${image})` }}
          className="flex size-[52px] shrink-0 items-center justify-center rounded-xl bg-cover bg-center text-[26px] text-white xl:size-[120px] xl:rounded-[20px] xl:text-[60px]"
        >
          {letter}
        </span>
        <div>
          <p className="text-sm xl:text-lg xl:leading-[26px]">{body}</p>
          <p className="mt-2 text-xs text-black/60 xl:text-sm">{detail}</p>
          {tag && (
            <p className="mt-3 inline-block rounded-full bg-brand/40 px-3 py-1 text-xs text-brand-deep">
              {tag}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
