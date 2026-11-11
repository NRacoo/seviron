"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { section, type GapSection } from "@/lib/content";

export function Gap() {
  const data = section<GapSection>("gap");
  const { headline, subhead, body, sensors } = data.content;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      gsap.from("[data-copy] > *", {
        opacity: 0,
        y: 26,
        stagger: 0.1,
        duration: 0.6,
        scrollTrigger: { trigger: root.current, start: "top 70%", toggleActions: "play none none reverse" },
      });

      gsap.from("[data-sensor]", {
        opacity: 0,
        rotation: () => gsap.utils.random(-20, 20),
        scale: 0.85,
        stagger: 0.05,
        duration: 0.5,
        scrollTrigger: { trigger: root.current, start: "top 65%", toggleActions: "play none none reverse" },
      });

      gsap.utils.toArray<HTMLElement>("[data-blink]").forEach((el, i) => {
        gsap.to(el, { opacity: 0.25, duration: 0.6 + i * 0.13, repeat: -1, yoyo: true, ease: "sine.inOut" });
      });
    },
    { scope: root, dependencies: [] },
  );

  return (
    <section ref={root} id="gap" className="relative overflow-hidden bg-navy px-5 py-28 md:px-8 md:py-36">
      <div className="mx-auto grid max-w-7xl gap-14 md:grid-cols-2 md:items-center">
        <div data-copy>
          <h2 className="text-[2rem] md:text-[3.2rem]">{headline}</h2>
          <h2 className="text-[2rem] text-muted md:text-[3.2rem]">{subhead}</h2>
          <p className="mt-7 max-w-md text-[15px] leading-relaxed text-muted">{body}</p>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" aria-label="Disconnected sensors">
          {sensors.map((s, i) => (
            <li
              key={s.brand}
              data-sensor
              id={`gap-sensor-${i}`}
              className="rounded-lg border border-white/12 bg-white/[0.03] p-3"
              style={{ transform: `translateY(${(i % 3) * 10}px)` }}
            >
              <span className="block text-[10px] tracking-wider text-white/45">{s.brand}</span>
              <span data-blink className="num mt-1.5 block text-base text-sky">
                {s.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
