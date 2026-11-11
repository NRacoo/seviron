"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { section, site, type WhySection } from "@/lib/content";

export function Why() {
  const data = section<WhySection>("why");
  const { headline, rows } = data.content;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.from("[data-row]", {
        opacity: 0,
        x: -20,
        stagger: 0.08,
        duration: 0.45,
        scrollTrigger: { trigger: root.current, start: "top 72%", toggleActions: "play none none reverse" },
      });
    },
    { scope: root, dependencies: [] },
  );

  return (
    <section ref={root} id="why" className="bg-navy px-5 py-28 md:px-8 md:py-36">
      <div className="mx-auto max-w-5xl">
        <h2 className="max-w-3xl text-[2rem] md:text-[3.2rem]">{headline}</h2>

        <table className="mt-12 w-full text-left text-[14px]">
          <thead className="text-[11px] uppercase tracking-wider text-white/40">
            <tr>
              <th className="pb-3 font-medium">Capability</th>
              <th className="pb-3 font-medium text-lime">{site.meta.product}</th>
              <th className="pb-3 font-medium">Others</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr data-row key={row.capability} className="border-t border-white/10">
                <td className="py-3.5 pr-4">{row.capability}</td>
                <td className="py-3.5 pr-4 text-gain">
                  <span aria-hidden>✓</span>
                  <span className="sr-only">Yes</span>
                </td>
                <td className="py-3.5 text-muted">{row.others}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
