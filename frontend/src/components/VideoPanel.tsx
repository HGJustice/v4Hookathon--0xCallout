"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { Close, Play } from "./icons";
import PhoneMockup from "./PhoneMockup";

// Paste a YouTube embed URL here when the demo video is ready,
// e.g. "https://www.youtube.com/embed/<id>?rel=0&autoplay=1".
const VIDEO_URL: string = "";

export default function VideoPanel() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // The phone scrolls up until it's centred on screen, then holds still while the
  // panel keeps moving, so the panel's bottom edge sweeps up and hides it.
  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const panel = panelRef.current!;
        const phone = phoneRef.current!;
        const travel = () => panel.offsetHeight - phone.offsetTop;
        gsap.to(phone, {
          y: travel,
          ease: "none",
          scrollTrigger: {
            trigger: panel,
            start: () => `top+=${phone.offsetTop + phone.offsetHeight / 2} center`,
            end: () => `+=${travel()}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      });
    },
    { scope: panelRef },
  );

  // While the modal is open: freeze the page behind it, move focus into the dialog and
  // keep Tab inside it, close on Escape, and hand focus back to the play button after.
  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    const trigger = triggerRef.current;
    lenis?.stop();
    html.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setOpen(false);
      if (e.key !== "Tab") return;
      const focusable = dialogRef.current!.querySelectorAll<HTMLElement>("button, iframe, a[href]");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      html.style.overflow = previousOverflow;
      lenis?.start();
      trigger?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <>
      <div
        ref={panelRef}
        className="panel-glow group relative mt-10 h-[520px] animate-fade-up overflow-hidden rounded-3xl [animation-delay:400ms] sm:mt-12 sm:h-[680px] xl:mt-16 xl:h-[780px]"
      >
        <div ref={phoneRef} className="absolute left-1/2 top-10 -translate-x-1/2 xl:top-[62px]">
          <PhoneMockup />
        </div>
        <button
          ref={triggerRef}
          type="button"
          aria-label="Play demo video"
          onClick={() => setOpen(true)}
          className="absolute inset-0 cursor-pointer"
        >
          <span className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow-[0_10px_40px_rgba(0,0,0,0.45)] ring-8 ring-white/15 backdrop-blur transition-transform duration-500 group-hover:scale-125 sm:size-20">
            <Play />
          </span>
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Demo video"
            onClick={(e) => e.stopPropagation()}
            className="steel-border w-full max-w-[880px] rounded-3xl bg-surface p-5 text-white"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <p className="font-display text-xl font-medium tracking-tight sm:text-[28px] sm:leading-[34px]">
                Multiverse Markets: Don&apos;t just argue, bet on it
              </p>
              <button ref={closeRef} type="button" aria-label="Close" onClick={() => setOpen(false)}>
                <Close />
              </button>
            </div>
            <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
              {VIDEO_URL ? (
                <iframe
                  src={VIDEO_URL}
                  title="Demo video"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="size-full"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-white/60">
                  Demo video coming soon
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
