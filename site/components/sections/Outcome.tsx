"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cssVar, section, type OutcomeSection } from "@/lib/content";

export function Outcome() {
  const data = section<OutcomeSection>("outcome");
  const c = data.content;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const trig = { trigger: root.current, start: "top 70%", toggleActions: "play none none reverse" } as const;

      gsap.from("[data-divider]", { xPercent: -50, opacity: 0, duration: 0.7, scrollTrigger: trig });
      gsap.from("[data-without] li", { opacity: 0, x: -20, stagger: 0.1, duration: 0.45, scrollTrigger: trig });
      gsap.from("[data-with] li", { opacity: 0, x: 20, stagger: 0.1, delay: 0.3, duration: 0.45, scrollTrigger: trig });
    },
    { scope: root, dependencies: [] },
  );

  return (
    <section ref={root} id="outcome" className="relative bg-navy px-5 py-28 md:px-8 md:py-36">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-[2rem] md:text-[3.2rem]">{c.headline}</h2>

        <div className="relative mt-14 grid gap-8 md:grid-cols-2">
          <div
            data-divider
            className="absolute left-1/2 top-0 hidden h-full w-px bg-white/15 md:block"
            aria-hidden
          />
          <Column title={c.without.title} items={c.without.items} color={cssVar(c.without.color)} flag="without" />
          <Column title={c.with.title} items={c.with.items} color={cssVar(c.with.color)} flag="with" />
        </div>
      </div>
    </section>
  );
}

function Column({
  title,
  items,
  color,
  flag,
}: {
  title: string;
  items: string[];
  color: string;
  flag: "without" | "with";
}) {
  return (
    <div {...{ [`data-${flag}`]: "" }}>
      <h3 className="text-sm uppercase tracking-[0.2em]" style={{ color }}>
        {title}
      </h3>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-xl border px-4 py-3.5 text-[15px]"
            style={{ borderColor: `${color}55`, background: `${color}14` }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
