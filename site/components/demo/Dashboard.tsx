"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cssVar, type DemoSection } from "@/lib/content";
import { ForecastChart } from "@/components/demo/ForecastChart";

export function Dashboard({
  data,
  step,
  onStep,
}: {
  data: DemoSection;
  step: number;
  onStep: (i: number) => void;
}) {
  const current = data.steps[step];
  const panel = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const tl = gsap.timeline();
      tl.from("[data-panel-body]", { opacity: 0, y: 16, duration: 0.35, ease: "power2.out" });

      if (current.id === "sensors") {
        tl.from("[data-card]", { opacity: 0, rotateX: -55, stagger: 0.06, duration: 0.4 }, 0.05);
      }
      if (current.id === "decision") {
        tl.from("[data-decision]", { y: 36, opacity: 0, duration: 0.45 }, 0.05).from(
          "[data-action]",
          { opacity: 0, x: -14, stagger: 0.12, duration: 0.3 },
          ">-0.1",
        );
      }
      if (current.id === "actions") {
        tl.from("[data-log-row]", { opacity: 0, x: -12, stagger: 0.1, duration: 0.3 }, 0.05);
      }
      if (current.id === "esg") {
        tl.from("[data-report]", { opacity: 0, scale: 0.92, stagger: 0.09, duration: 0.35 }, 0.05);
      }
    },
    { scope: panel, dependencies: [step] },
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#081330] shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-medium">{data.site.name}</span>
          <span className="num text-[11px] text-gain">{data.site.sensorsReporting} reporting</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-white/45">
          <span>{data.site.source}</span>
          <span className="num">updated {data.site.updated}</span>
          <span className="rounded-full border border-orange/50 px-2 py-0.5 text-orange">{data.content.badge}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-[180px_1fr]">
        <nav className="flex gap-1 overflow-x-auto border-b border-white/10 p-2 md:flex-col md:border-b-0 md:border-r" aria-label="Demo steps">
          {data.steps.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onStep(i)}
              aria-current={i === step ? "page" : undefined}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-[12px] transition-colors ${
                i === step ? "bg-lime text-navy" : "text-muted hover:bg-white/5 hover:text-white"
              }`}
            >
              {s.tab}
            </button>
          ))}
        </nav>

        <div ref={panel} className="min-h-[420px] p-4 md:p-6">
          <p className="text-[13px] text-muted">{current.caption}</p>

          <div data-panel-body className="mt-5">
            {current.id === "sensors" ? <Sensors data={data} /> : null}
            {current.id === "forecast" ? (
              <ForecastChart
                config={data.forecastSeries}
                unit={data.parameters.find((p) => p.key === data.forecastSeries.parameter)?.unit ?? ""}
                active
              />
            ) : null}
            {current.id === "decision" && current.decision ? (
              <div data-decision className="rounded-xl border border-loss/40 bg-loss/10 p-5">
                <h3 className="text-base">{current.decision.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {current.decision.actions.map((a) => (
                    <li data-action key={a} className="flex items-start gap-2.5 text-[13px]">
                      <span className="mt-0.5 text-gain" aria-hidden>
                        ✓
                      </span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {current.id === "actions" && current.log ? (
              <table className="w-full text-left text-[13px]">
                <thead className="text-[11px] uppercase tracking-wider text-white/40">
                  <tr>
                    <th className="pb-2 font-medium">Time</th>
                    <th className="pb-2 font-medium">Owner</th>
                    <th className="pb-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {current.log.map((row) => (
                    <tr data-log-row key={row.time} className="border-t border-white/8">
                      <td className="num py-2.5 pr-4 text-sky">{row.time}</td>
                      <td className="py-2.5 pr-4 text-muted">{row.owner}</td>
                      <td className="py-2.5">{row.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
            {current.id === "esg" && current.report ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {current.report.map((r) => (
                  <li data-report key={r.label} className="rounded-xl border border-white/12 bg-white/[0.04] p-4">
                    <p className="text-[11px] uppercase tracking-wider text-white/45">{r.label}</p>
                    <p className="num mt-2 text-xl text-lime">{r.value}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Sensors({ data }: { data: DemoSection }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {data.parameters.map((p) => {
        const color = cssVar(data.statusColors[p.status]);
        return (
          <li data-card key={p.key} className="rounded-xl border border-white/12 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-muted">{p.label}</span>
              <span className="h-2 w-2 rounded-full" style={{ background: color }} aria-hidden />
            </div>
            <p className="num mt-2 text-2xl" style={{ color }}>
              {p.now}
              <span className="ml-1 text-[11px] text-white/40">{p.unit}</span>
            </p>
            <p className="num mt-2 text-[11px] text-white/45">
              peak {p.peak} @ {p.peakAt} · limit {p.limit}
            </p>
            <span className="sr-only">{p.status}</span>
          </li>
        );
      })}
    </ul>
  );
}
