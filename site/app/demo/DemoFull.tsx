"use client";

import { useState } from "react";
import { section, site, type DemoSection } from "@/lib/content";
import { Dashboard } from "@/components/demo/Dashboard";

export function DemoFull() {
  const data = section<DemoSection>("demo");
  const [step, setStep] = useState(0);

  return (
    <main className="min-h-screen bg-navy px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <a href="/" className="display text-xs tracking-[0.28em] text-muted hover:text-lime">
              ← {site.nav.logo}
            </a>
            <h1 className="mt-3 text-[1.6rem] md:text-[2.2rem]">{data.content.headline}</h1>
            <p className="mt-2 text-[13px] text-muted">{data.interaction}</p>
          </div>
          <span className="rounded-full border border-orange/50 px-3 py-1 text-[11px] text-orange">
            {data.content.badge}
          </span>
        </div>

        <div className="mt-6">
          <Dashboard data={data} step={step} onStep={setStep} />
        </div>
      </div>
    </main>
  );
}
