"use client";

import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import PhoneMockup from "./PhoneMockup";
import SectionTitle from "./SectionTitle";

// Desktop (≥1280px): a scroll-driven walkthrough. The phone stays pinned on the left
// while the five steps scroll by on the right; whichever step crosses the middle of the
// screen becomes active and the phone cross-fades to that step's screen.
// Below 1280px: the same steps as a grid of cards. Monochrome on purpose (graphite,
// white, silver). The phone only renders on desktop (decided after hydration, since the
// server can't know the screen width).
const STEPS = [
  {
    title: "Call it out",
    body: "Two people disagree on Farcaster. One of them tags @multiverse with the claim, the stake and the deadline.",
    screen: <ThreadScreen />,
  },
  {
    title: "The bot sets it up",
    body: "The bot replies with a ready-made market and a link to the mini-app, with the question, stake and date already filled in.",
    screen: <BotScreen />,
  },
  {
    title: "Both sides deposit",
    body: "The market goes live only when both put in their $10. One transaction mints YES and NO tokens and opens a Uniswap V4 pool at 50/50.",
    screen: <DepositScreen />,
  },
  {
    title: "Everyone bets",
    body: "The bot posts the market back into the thread. Anyone can buy YES or NO, and the price becomes the crowd's odds.",
    screen: <TradeScreen />,
  },
  {
    title: "Resolve and redeem",
    body: "After the deadline a result is proposed with a bond. Undisputed, Chainlink CRE finalises it; disputed, a multisig decides. Winners redeem for the pot.",
    screen: <ResolveScreen />,
  },
];

const DESKTOP = "(min-width: 1280px)";
const subscribe = (onChange: () => void) => {
  const query = matchMedia(DESKTOP);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
// true / false in the browser, null on the server and during hydration.
const useIsDesktop = () => useSyncExternalStore(subscribe, () => matchMedia(DESKTOP).matches, () => null);

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const isDesktop = useIsDesktop();

  useGSAP(
    () => {
      listRef.current!.querySelectorAll<HTMLElement>(".how-step").forEach((step, i) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
    },
    { scope: listRef },
  );

  return (
    <section id="how-it-works" className="relative">
      <SectionTitle>How it works</SectionTitle>

      <div className="relative w-full bg-[#0d0d0e] px-5 text-white sm:px-10 2xl:px-0">
        {/* Below 1280px: one card per step. One column on phones, two on tablets, and a
            3 + 2 grid on small laptops. */}
        <ol className="mx-auto grid max-w-[1200px] gap-4 py-16 md:grid-cols-2 lg:grid-cols-6 xl:hidden">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="flex flex-col rounded-3xl border border-white/10 bg-linear-to-b from-white/[0.06] to-white/[0.02] p-6 sm:p-8 md:last:col-span-2 lg:col-span-2 lg:last:col-span-3 lg:nth-4:col-span-3"
            >
              <span className="flex size-10 items-center justify-center rounded-full border border-white/15 text-sm text-white/70">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-8 text-2xl font-extralight sm:text-[28px] sm:leading-9">{step.title}</h3>
              <p className="mt-3 text-base leading-7 text-white/60">{step.body}</p>
            </li>
          ))}
        </ol>

        {/* Desktop: pinned phone on the left, steps scrolling by on the right. */}
        <div className="mx-auto hidden max-w-[1200px] grid-cols-2 gap-20 xl:grid">
          <div>
            <div className="sticky top-[max(96px,calc(50vh-328px))] flex justify-center" aria-hidden="true">
              {isDesktop && (
                <PhoneMockup>
                  {STEPS.map((step, i) => (
                    <div
                      key={step.title}
                      className={`absolute inset-0 transition duration-500 motion-reduce:transition-none ${
                        i === active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
                      }`}
                    >
                      {step.screen}
                    </div>
                  ))}
                </PhoneMockup>
              )}
            </div>
          </div>

          <ol ref={listRef}>
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className={`how-step flex min-h-[80vh] flex-col justify-center py-12 transition-opacity duration-500 ${
                  i === active ? "opacity-100" : "opacity-30"
                }`}
              >
                <p className="text-sm tracking-[0.2em] text-white/40">
                  {String(i + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
                </p>
                <h3 className="mt-4 text-[40px] leading-[48px] font-extralight">{step.title}</h3>
                <p className="mt-4 max-w-[460px] text-lg leading-8 text-white/60">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ——— Phone screens (monochrome, demo content) ——— */

function Screen({ app, children }: { app: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col gap-3 pt-2 text-[13px] leading-5">
      <p className="text-[11px] tracking-[0.18em] text-white/40 uppercase">{app}</p>
      {children}
    </div>
  );
}

function Avatar({ label }: { label: string }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-white/35 to-white/10 text-[11px]">
      {label}
    </span>
  );
}

function Post({ handle, time, children }: { handle: string; time: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-white/[0.05] p-3">
      <Avatar label={handle[1].toUpperCase()} />
      <div className="min-w-0">
        <p className="text-white/45">
          {handle} · {time}
        </p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

function Pill({ children, solid = false }: { children: ReactNode; solid?: boolean }) {
  return (
    <span
      className={`block rounded-xl py-2.5 text-center font-medium ${solid ? "bg-white text-black" : "bg-white/[0.07] text-white/70"}`}
    >
      {children}
    </span>
  );
}

function Row({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/[0.05] px-3 py-2.5">
      <span>{left}</span>
      <span className="text-white/60">{right}</span>
    </div>
  );
}

function ThreadScreen() {
  return (
    <Screen app="Farcaster">
      <Post handle="@dan" time="4m">
        1+1=3. Fight me.
      </Post>
      <Post handle="@kim" time="2m">
        <span className="font-medium text-white">@multiverse</span> 1+1=3, $10 each, resolves Friday
      </Post>
      <p className="flex items-center gap-2 px-1 text-white/40">
        <span className="flex gap-1">
          <span className="size-1.5 rounded-full bg-white/50" />
          <span className="size-1.5 rounded-full bg-white/35" />
          <span className="size-1.5 rounded-full bg-white/20" />
        </span>
        @multiverse is replying
      </p>
    </Screen>
  );
}

function BotScreen() {
  return (
    <Screen app="Farcaster">
      <Post handle="@kim" time="2m">
        <span className="font-medium text-white">@multiverse</span> 1+1=3, $10 each, resolves Friday
      </Post>
      <Post handle="@multiverse" time="now">
        Market ready. Both sides deposit to open it.
        <div className="mt-3 rounded-xl border border-white/10 bg-black/40 p-3">
          <p className="text-[15px]">Does 1+1=3?</p>
          <p className="mt-1 text-white/45">$10 each · Ends Friday</p>
          <span className="mt-3 block rounded-lg bg-white py-2 text-center font-medium text-black">
            Open in mini-app
          </span>
        </div>
      </Post>
    </Screen>
  );
}

function DepositScreen() {
  return (
    <Screen app="Multiverse · mini-app">
      <p className="text-xl">Does 1+1=3?</p>
      <p className="-mt-2 text-white/45">$10 each · Ends Friday</p>
      <Row left="@dan · YES" right="$10 ✓" />
      <Row left="@kim · NO" right="$10 ✓" />
      <div className="rounded-xl border border-white/10 p-3 text-white/60">
        <p className="text-white">Both sides in. Opening market…</p>
        <p className="mt-2">✓ YES and NO tokens minted</p>
        <p>✓ Uniswap V4 pool seeded at 50/50</p>
      </div>
      <Pill solid>Market live</Pill>
    </Screen>
  );
}

function TradeScreen() {
  return (
    <Screen app="Multiverse · live market">
      <p className="text-white/45">Does 1+1=3? · Ends Friday</p>
      <p className="-mt-2 text-4xl">
        34% <span className="text-sm text-white/45">chance YES</span>
      </p>
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-14 w-full">
        <path
          d="M0 15 L12 14 L24 17 L36 16 L48 20 L60 19 L72 22 L84 20 L100 20"
          fill="none"
          stroke="white"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="grid grid-cols-2 gap-2">
        <Pill solid>YES 34¢</Pill>
        <Pill>NO 66¢</Pill>
      </div>
      <Row left="Amount" right="$5" />
      <Pill solid>Place bet</Pill>
      <div className="space-y-1 px-1 text-white/45">
        <p>@ana bought YES · $5</p>
        <p>@leo bought NO · $12</p>
      </div>
    </Screen>
  );
}

function ResolveScreen() {
  return (
    <Screen app="Multiverse · resolved">
      <p className="text-white/45">Does 1+1=3?</p>
      <p className="-mt-2 text-4xl">NO</p>
      <Row left="✓ Proposed NO" right="Bond posted" />
      <Row left="✓ Dispute window" right="No disputes" />
      <Row left="✓ Finalised" right="Chainlink CRE" />
      <div className="mt-1 rounded-2xl bg-white p-4 text-black">
        <p className="text-black/50">@kim, you won</p>
        <p className="mt-1 text-2xl">$20.00</p>
        <span className="mt-3 block rounded-lg bg-black py-2.5 text-center font-medium text-white">Redeem</span>
      </div>
    </Screen>
  );
}
