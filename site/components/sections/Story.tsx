"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { section, type StorySection } from "@/lib/content";
import { endFor } from "@/lib/scroll";
import { JakartaMap } from "@/components/ui/JakartaMap";
import { Counter } from "@/components/ui/Counter";

export function Story() {
  const data = section<StorySection>("story");
  const root = useRef<HTMLElement>(null);
  const beats = data.beats;

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        gsap.set("[data-beat]", { opacity: 1, position: "relative" });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: endFor(data.scrollLength),
          pin: data.pin,
          scrub: 1,
        },
      });

      gsap.set("[data-beat]", { opacity: 0 });

      beats.forEach((_, i) => {
        const beat = `[data-beat="${i}"]`;
        tl.to(beat, { opacity: 1, duration: 0.4 });
        tl.from(`${beat} [data-rise]`, { opacity: 0, y: 28, duration: 0.4 }, "<");

        if (i === 0) {
          tl.to("[data-haze-story]", { opacity: 0.55, duration: 0.5 }, "<");
          tl.from(`${beat} [data-bar="jakarta"]`, { scaleX: 0, transformOrigin: "left center", duration: 0.6 }, "<0.1");
          tl.from(`${beat} [data-bar="who"]`, { scaleX: 0, transformOrigin: "left center", duration: 0.4 }, "<0.1");
        }
        if (i === 1) tl.from(`${beat} [data-gate]`, { yPercent: -100, duration: 0.6 }, "<");
        if (i === 2) {
          tl.from(`${beat} [data-chip]`, { opacity: 0, y: -24, stagger: 0.08, duration: 0.35 }, "<");
          tl.from(`${beat} [data-stamp]`, { opacity: 0, scale: 2.4, rotate: -8, duration: 0.4, ease: "power3.out" }, ">-0.1");
        }
        if (i === 4) tl.from(`${beat} [data-dot]`, { opacity: 0, scale: 0, stagger: { each: 0.05, from: "random" }, duration: 0.3 }, "<");

        tl.to({}, { duration: 0.5 });
        if (i < beats.length - 1) tl.to(beat, { opacity: 0, duration: 0.3 });
      });
    },
    { scope: root, dependencies: [] },
  );

  return (
    <section ref={root} id="story" className="grain relative h-screen overflow-hidden bg-navy">
      <div data-haze-story className="haze pointer-events-none absolute inset-0 opacity-25" aria-hidden />

      <div className="relative z-10 mx-auto flex h-full max-w-5xl items-center px-5 md:px-8">
        {beats.map((beat, i) => (
          <div key={i} data-beat={i} className="absolute inset-x-5 md:inset-x-8">
            {beat.kicker ? (
              <p data-rise className="display text-xs tracking-[0.36em] text-lime">
                {beat.kicker}
              </p>
            ) : null}

            <h2 data-rise className="mt-5 max-w-3xl text-[1.8rem] md:text-[3.2rem]">
              {beat.text}
            </h2>

            {beat.stat && beat.compare ? (
              <div data-rise className="mt-10 max-w-xl space-y-5">
                <Bar
                  flag="jakarta"
                  label={beat.stat.label}
                  value={beat.stat.value}
                  unit={beat.stat.unit}
                  decimals={beat.stat.decimals}
                  max={beat.stat.value}
                  color="var(--c-orange)"
                />
                <Bar
                  flag="who"
                  label={beat.compare.label}
                  value={beat.compare.value}
                  unit={beat.compare.unit}
                  decimals={0}
                  max={beat.stat.value}
                  color="var(--c-skyBlue)"
                />
              </div>
            ) : null}

            {beat.stat && !beat.compare ? (
              <div data-rise className="mt-10">
                <p className="num text-[4rem] leading-none text-loss md:text-[7rem]">
                  <Counter value={beat.stat.value} decimals={beat.stat.decimals} />
                </p>
                <p className="mt-3 max-w-md text-sm text-muted">{beat.stat.label}</p>
                <div className="mt-8 max-w-lg">
                  <JakartaMap count={18} />
                </div>
              </div>
            ) : null}

            {beat.chips ? (
              <ul className="mt-9 flex flex-wrap gap-2.5">
                {beat.chips.map((chip) => (
                  <li
                    key={chip}
                    data-chip
                    className="rounded-full border border-white/15 px-3.5 py-1.5 text-[12px] text-muted"
                  >
                    {chip}
                  </li>
                ))}
              </ul>
            ) : null}

            {beat.bigWord ? (
              <p data-stamp className="display mt-9 text-[2.6rem] text-loss md:text-[5rem]">
                {beat.bigWord}
              </p>
            ) : null}

            {i === 1 ? (
              <div className="relative mt-10 h-28 max-w-lg overflow-hidden rounded border border-white/10">
                <div
                  data-gate
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(90deg, rgba(255,255,255,0.14) 0 3px, transparent 3px 22px)",
                    backgroundColor: "#060F26",
                  }}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <ul className="absolute inset-x-5 bottom-5 z-10 space-y-0.5 text-[10px] leading-relaxed text-white/35 md:inset-x-8">
        {data.sources.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </section>
  );
}

function Bar({
  flag,
  label,
  value,
  unit,
  decimals,
  max,
  color,
}: {
  flag: string;
  label: string;
  value: number;
  unit?: string;
  decimals: number;
  max: number;
  color: string;
}) {
  const pct = Math.max(4, (value / max) * 100);
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="num" style={{ color }}>
          {value.toFixed(decimals)} {unit}
        </span>
      </div>
      <div className="mt-2 h-3 w-full rounded-full bg-white/8">
        <div data-bar={flag} className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
