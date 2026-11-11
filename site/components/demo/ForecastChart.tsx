"use client";

import { useMemo, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { buildSeries, pathFrom } from "@/lib/series";
import type { DemoSection } from "@/lib/content";

const BOX = { w: 640, h: 220 };

export function ForecastChart({
  config,
  unit,
  active,
}: {
  config: DemoSection["forecastSeries"];
  unit: string;
  active: boolean;
}) {
  const root = useRef<SVGSVGElement>(null);

  const { observedPath, forecastPath, limitY, exceedPath, domain } = useMemo(() => {
    const { observed, forecast } = buildSeries({
      observedEnd: config.observedEnd,
      forecastPeak: config.forecastPeak,
      peakHour: config.peakHour,
    });
    const all = [...observed, ...forecast];
    const min = 0;
    const max = Math.max(...all.map((p) => p.value), config.limit) * 1.15;
    const d = { min, max, x0: -23, x1: 24 };

    const y = (v: number) => BOX.h - ((v - min) / (max - min)) * BOX.h;
    const x = (h: number) => ((h - d.x0) / (d.x1 - d.x0)) * BOX.w;

    const above = forecast.filter((p) => p.value >= config.limit);
    const exceed = above.length
      ? `M${x(above[0].hour)},${y(config.limit)} ` +
        above.map((p) => `L${x(p.hour)},${y(p.value)}`).join(" ") +
        ` L${x(above[above.length - 1].hour)},${y(config.limit)} Z`
      : "";

    return {
      observedPath: pathFrom(observed, BOX, d),
      forecastPath: pathFrom(forecast, BOX, d),
      limitY: y(config.limit),
      exceedPath: exceed,
      domain: d,
    };
  }, [config]);

  useGSAP(
    () => {
      if (!active) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const lines = gsap.utils.toArray<SVGPathElement>("[data-draw]");
      lines.forEach((l) => {
        const len = l.getTotalLength();
        gsap.set(l, { strokeDasharray: l.dataset.dashed ? "6 6" : len, strokeDashoffset: reduced ? 0 : len });
      });
      if (reduced) {
        gsap.set("[data-exceed]", { opacity: 1 });
        return;
      }
      gsap
        .timeline()
        .to("[data-draw='observed']", { strokeDashoffset: 0, duration: 1.1, ease: "none" })
        .to("[data-draw='forecast']", { strokeDashoffset: 0, duration: 1.1, ease: "none" }, ">-0.2")
        .fromTo("[data-exceed]", { opacity: 0 }, { opacity: 1, duration: 0.5 }, ">-0.4");
    },
    { scope: root, dependencies: [active, observedPath, forecastPath] },
  );

  const xOf = (h: number) => ((h - domain.x0) / (domain.x1 - domain.x0)) * BOX.w;

  return (
    <svg
      ref={root}
      viewBox={`0 0 ${BOX.w} ${BOX.h + 26}`}
      className="w-full"
      role="img"
      aria-label={`24 hour observed and forecast ${config.parameter} against a limit of ${config.limit} ${unit}`}
    >
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={BOX.w} y1={BOX.h * f} y2={BOX.h * f} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      ))}

      <path data-exceed d={exceedPath} fill="var(--c-loss)" opacity="0" style={{ mixBlendMode: "screen" }} />

      <line x1="0" x2={BOX.w} y1={limitY} y2={limitY} stroke="var(--c-loss)" strokeWidth="1.2" strokeDasharray="4 5" />
      <text x="4" y={limitY - 6} fill="var(--c-loss)" fontSize="11" className="num">
        limit {config.limit} {unit}
      </text>

      <line x1={xOf(0)} x2={xOf(0)} y1="0" y2={BOX.h} stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
      <text x={xOf(0) + 5} y="14" fill="rgba(255,255,255,0.5)" fontSize="11">
        now
      </text>

      <path data-draw="observed" d={observedPath} fill="none" stroke="var(--c-skyBlue)" strokeWidth="2.4" />
      <path data-draw="forecast" data-dashed="1" d={forecastPath} fill="none" stroke="var(--c-lime)" strokeWidth="2.4" />

      <text x="0" y={BOX.h + 18} fill="rgba(255,255,255,0.4)" fontSize="11" className="num">
        -24h
      </text>
      <text x={BOX.w - 24} y={BOX.h + 18} fill="rgba(255,255,255,0.4)" fontSize="11" className="num">
        +24h
      </text>
    </svg>
  );
}
