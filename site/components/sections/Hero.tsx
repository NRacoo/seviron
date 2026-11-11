"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { section, type HeroSection } from "@/lib/content";
import { endFor } from "@/lib/scroll";

export function Hero() {
  const data = section<HeroSection>("hero");
  const { kicker, headline, subhead, scrollHint } = data.content;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-anim]", { opacity: 1, y: 0 });
        gsap.set("[data-haze]", { opacity: 0.4 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: endFor(data.scrollLength),
            pin: data.pin,
            scrub: 1,
          },
        });
        tl.from("[data-headline]", { opacity: 0, y: 40, duration: 0.5 }, 0)
          .from("[data-factory]", { opacity: 0, y: 80, duration: 0.5 }, 0.4)
          .to("[data-haze]", { opacity: 0.4, duration: 1 }, 0)
          .to("[data-hint]", { opacity: 0, duration: 0.3 }, 0.7);

        gsap.to("[data-hint-arrow]", { y: 8, repeat: -1, yoyo: true, duration: 0.9, ease: "sine.inOut" });
      });
    },
    { scope: root, dependencies: [] },
  );

  return (
    <section ref={root} id="hero" className="grain relative flex h-screen items-center overflow-hidden bg-navy">
      <div data-haze className="haze pointer-events-none absolute inset-0 opacity-0" aria-hidden />

      <svg
        data-factory
        viewBox="0 0 1200 320"
        className="pointer-events-none absolute bottom-0 left-0 w-full"
        aria-hidden
      >
        <g fill="#060F26">
          <rect x="0" y="210" width="1200" height="110" />
          <rect x="90" y="150" width="150" height="70" />
          <rect x="130" y="60" width="26" height="95" />
          <rect x="190" y="90" width="22" height="65" />
          <rect x="300" y="170" width="210" height="50" />
          <rect x="360" y="80" width="30" height="92" />
          <rect x="560" y="130" width="120" height="90" />
          <rect x="600" y="50" width="24" height="82" />
          <rect x="740" y="175" width="190" height="45" />
          <rect x="800" y="95" width="28" height="82" />
          <rect x="980" y="145" width="160" height="75" />
          <rect x="1040" y="70" width="24" height="78" />
        </g>
        <g fill="var(--c-orange)" opacity="0.65">
          <rect x="325" y="192" width="8" height="8" />
          <rect x="355" y="192" width="8" height="8" />
          <rect x="585" y="160" width="8" height="8" />
          <rect x="1005" y="178" width="8" height="8" />
        </g>
      </svg>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 md:px-8">
        <p className="display text-xs tracking-[0.42em] text-lime">{kicker}</p>
        <h1 data-headline data-anim className="mt-6 text-[2.1rem] leading-[1.06] md:text-[4.1rem]">
          {headline}
        </h1>
        <p data-hint={scrollHint ? "" : undefined} className="mt-7 flex items-center gap-3 text-sm text-muted">
          {subhead}
          {scrollHint ? (
            <span data-hint-arrow className="inline-block text-lime" aria-hidden>
              ↓
            </span>
          ) : null}
        </p>
      </div>
    </section>
  );
}
