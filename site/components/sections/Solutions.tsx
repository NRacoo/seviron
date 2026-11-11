"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { section, type SolutionsSection } from "@/lib/content";

export function Solutions() {
  const data = section<SolutionsSection>("solutions");
  const { headline, items, showPricing } = data.content;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from("[data-item]", {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.5,
        scrollTrigger: { trigger: root.current, start: "top 72%", toggleActions: "play none none reverse" },
      });
    },
    { scope: root, dependencies: [] },
  );

  return (
    <section ref={root} id="solutions" className="bg-navy px-5 py-28 md:px-8 md:py-36">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-[2rem] md:text-[3.2rem]">{headline}</h2>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <li
              data-item
              key={item.title}
              className={`rounded-xl border p-5 ${
                item.primary ? "border-lime/60 bg-lime/[0.06]" : "border-white/10 bg-white/[0.02] opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base">{item.title}</h3>
                {item.label ? (
                  <span className="rounded-full border border-white/25 px-2 py-0.5 text-[10px] text-muted">
                    {item.label}
                  </span>
                ) : null}
              </div>
              <p className="mt-2.5 text-[13px] leading-relaxed text-muted">{item.text}</p>
              {showPricing ? <p className="num mt-4 text-[12px] text-lime">{item.price}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
