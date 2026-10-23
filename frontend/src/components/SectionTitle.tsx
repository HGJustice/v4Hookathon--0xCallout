"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

// Section intro band, like cian.app's: the title is centred in a band that sticks
// under the navbar while the section's content (placed right after the band) slides
// up over it. The title zooms in two scroll-linked phases:
// 1. 0.7 → 1 while the band rises into place;
// 2. 1 → 1.5 (less if that would overflow the band) as the content climbs over the
//    lower half of the band, until it covers the fully zoomed title.
// Both phases are timed from the section itself (the band's parent), so they work no
// matter what follows the band — a plain panel, a pinned stage, or a hidden element.
const MAX_SCALE = 1.5;
const BAND_PADDING = 40; // the band's horizontal padding (px-5 on both sides)

export default function SectionTitle({ children }: { children: ReactNode }) {
  const bandRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const band = bandRef.current!;
        const title = titleRef.current!;
        const section = band.parentElement!; // not sticky, so it measures reliably
        const nav = () => document.querySelector("header")?.offsetHeight ?? 80;
        // Never zoom wider than the band, so long titles don't overflow narrow screens.
        const maxScale = () => Math.min(MAX_SCALE, (band.clientWidth - BAND_PADDING) / title.offsetWidth);

        gsap.fromTo(
          title,
          { scale: 0.7 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: () => `top top+=${nav()}`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
        // Phase 2 starts as the band sticks. The content's top edge then sits at the
        // band's bottom and must climb half the band minus half the zoomed title to
        // reach the title, which is how far this phase scrolls.
        gsap.fromTo(
          title,
          { scale: 1 },
          {
            scale: maxScale,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: section,
              start: () => `top top+=${nav()}`,
              end: () => `+=${band.offsetHeight / 2 - (title.offsetHeight * maxScale()) / 2}`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    },
    { scope: bandRef },
  );

  return (
    <div
      ref={bandRef}
      className="sticky top-16 flex h-[280px] items-center justify-center overflow-x-clip px-5 sm:top-20 sm:h-[360px]"
    >
      <h2
        ref={titleRef}
        className="text-center text-3xl font-normal xl:text-[40px] xl:leading-[48px]"
      >
        {children}
      </h2>
    </div>
  );
}
