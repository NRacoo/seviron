"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { section, type GapSection, type ProductSection } from "@/lib/content";
import { endFor } from "@/lib/scroll";
import { Shield } from "@/components/ui/Shield";

export function Product() {
  const data = section<ProductSection>("product");
  const sensors = section<GapSection>("gap").content.sensors;
  const { kicker, headline, pillars } = data.content;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-sensor-fly]", { opacity: 1, x: 0, y: 0, rotation: 0 });
        gsap.set("[data-pillar]", { opacity: 1, y: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set("[data-sensor-fly]", {
          x: (i: number) => gsap.utils.random(-260, 260, 1, true)() * (i % 2 ? 1 : -1) * 0.5 - 140,
          y: (i: number) => (i % 2 ? -1 : 1) * (70 + i * 14),
          rotation: () => gsap.utils.random(-25, 25),
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: endFor(data.scrollLength),
            pin: data.pin,
            scrub: 1,
          },
        });

        tl.to("[data-haze-product]", { opacity: 0, duration: 0.6 }, 0)
          .to("[data-sensor-fly]", { x: 0, y: 0, rotation: 0, stagger: 0.04, duration: 0.7, ease: "power2.inOut" }, 0)
          .from("[data-shield]", { opacity: 0, scale: 0.7, duration: 0.4 }, 0.5)
          .from("[data-pillar]", { opacity: 0, y: 30, stagger: 0.12, duration: 0.4 }, 0.7);
      });
    },
    { scope: root, dependencies: [] },
  );

  return (
    <section ref={root} id="product" className="relative flex h-screen items-center overflow-hidden bg-navy">
      <div data-haze-product className="haze pointer-events-none absolute inset-0 opacity-45" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 md:px-8">
        <p className="display text-xs tracking-[0.36em] text-lime">{kicker}</p>
        <h2 className="mt-5 max-w-3xl text-[2rem] md:text-[3.4rem]">{headline}</h2>

        <div className="mt-10 flex items-center gap-2 overflow-hidden md:gap-3">
          {sensors.map((s) => (
            <span
              key={s.brand}
              data-sensor-fly
              className="rounded-md border border-sky/35 bg-sky/10 px-2.5 py-1.5 text-[10px] text-sky"
            >
              {s.brand}
            </span>
          ))}
          <span data-shield className="ml-2 inline-flex shrink-0 items-center gap-2">
            <Shield className="h-9 w-9" />
            <span className="display text-sm tracking-[0.2em] text-lime">PERISAI</span>
          </span>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <li data-pillar key={p.title} className="rounded-xl border border-white/12 bg-white/[0.04] p-5">
              <h3 className="text-base text-lime">{p.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
