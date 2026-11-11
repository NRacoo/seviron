"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { section, type AboutSection } from "@/lib/content";

export function About() {
  const data = section<AboutSection>("about");
  const c = data.content;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from("[data-person]", {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.45,
        scrollTrigger: { trigger: root.current, start: "top 72%", toggleActions: "play none none reverse" },
      });
    },
    { scope: root, dependencies: [] },
  );

  return (
    <section ref={root} id="about" className="bg-navy px-5 py-28 md:px-8 md:py-36">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-3xl text-[2rem] md:text-[3.2rem]">{c.headline}</h2>
        <p className="mt-5 max-w-xl text-[15px] text-muted">{c.mission}</p>

        <div className="mt-14 grid gap-12 md:grid-cols-[2fr_1fr]">
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.22em] text-lime">Team</h3>
            <ul className="mt-5 grid gap-4 sm:grid-cols-3">
              {c.team.map((p) => (
                <li data-person key={p.name} className="rounded-xl border border-white/12 bg-white/[0.04] p-4">
                  <p className="text-[14px]">{p.name}</p>
                  <p className="mt-1.5 text-[12px] text-muted">{p.role}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] uppercase tracking-[0.22em] text-sky">Advisors</h3>
            <ul className="mt-5 space-y-3">
              {c.advisors.map((p) => (
                <li data-person key={p.name} className="border-l border-sky/40 pl-3.5">
                  <p className="text-[14px]">{p.name}</p>
                  <p className="text-[12px] text-muted">{p.role}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-12 text-[12px] text-white/35">{c.partners}</p>
      </div>
    </section>
  );
}
