"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { section, type DemoSection } from "@/lib/content";
import { endFor } from "@/lib/scroll";
import { Dashboard } from "@/components/demo/Dashboard";

export function Demo() {
  const data = section<DemoSection>("demo");
  const root = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: endFor(data.scrollLength),
        pin: data.pin,
        scrub: true,
        onUpdate: (self) => {
          const i = Math.min(data.steps.length - 1, Math.floor(self.progress * data.steps.length));
          setStep((prev) => (prev === i ? prev : i));
        },
      });

      return () => st.kill();
    },
    { scope: root, dependencies: [] },
  );

  return (
    <section ref={root} id="demo" className="relative flex min-h-screen items-center bg-navy px-5 py-20 md:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="display text-xs tracking-[0.36em] text-lime">{data.content.kicker}</p>
            <h2 className="mt-4 text-[1.8rem] md:text-[2.8rem]">{data.content.headline}</h2>
          </div>
          <a
            href={data.content.openFull.href}
            className="rounded-full border border-white/25 px-4 py-2 text-[12px] text-muted transition-colors hover:border-lime hover:text-lime"
          >
            {data.content.openFull.label}
          </a>
        </div>

        <div className="mt-7">
          <Dashboard data={data} step={step} onStep={setStep} />
        </div>
      </div>
    </section>
  );
}
