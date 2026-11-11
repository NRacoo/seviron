import type { Point } from "@/types/decision";
import styles from "./LineChart.module.css";

interface Series {
  points: Point[];
  color: string;
  dashed?: boolean;
  fill?: boolean;
}

export function LineChart({
  series,
  limit,
  height = 170,
  xLabels = 5,
  unit,
}: {
  series: Series[];
  limit?: number;
  height?: number;
  xLabels?: number;
  unit?: string;
}) {
  const all = series.flatMap((s) => s.points);
  if (all.length < 2) return null;

  const w = 760;
  const padL = 44;
  const padR = 12;
  const padT = 10;
  const padB = 22;

  const values = all.map((p) => p.value).concat(limit !== undefined ? [limit] : []);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const pad = (rawMax - rawMin) * 0.15 || 1;
  const min = Math.max(0, rawMin - pad);
  const max = rawMax + pad;

  const times = all.map((p) => new Date(p.at).getTime());
  const t0 = Math.min(...times);
  const t1 = Math.max(...times);

  const x = (iso: string) =>
    padL + ((new Date(iso).getTime() - t0) / (t1 - t0 || 1)) * (w - padL - padR);
  const y = (v: number) =>
    padT + (1 - (v - min) / (max - min || 1)) * (height - padT - padB);

  const ticks = [min, (min + max) / 2, max];

  const labelPoints = all
    .filter((_, i) => i % Math.max(1, Math.floor(all.length / xLabels)) === 0)
    .slice(0, xLabels);

  return (
    <svg
      className={styles.chart}
      viewBox={`0 0 ${w} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Trend chart${unit ? ` in ${unit}` : ""}`}
    >
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} className={styles.grid} />
          <text x={padL - 8} y={y(t) + 3.5} className={styles.axis} textAnchor="end">
            {t >= 1000 ? Math.round(t) : Math.round(t * 10) / 10}
          </text>
        </g>
      ))}

      {limit !== undefined ? (
        <>
          <line x1={padL} x2={w - padR} y1={y(limit)} y2={y(limit)} className={styles.limit} />
          <text x={w - padR} y={y(limit) - 5} className={styles.limitText} textAnchor="end">
            limit {limit}
          </text>
        </>
      ) : null}

      {series.map((s, si) => {
        if (s.points.length < 2) return null;
        const d = s.points
          .map((p, i) => `${i === 0 ? "M" : "L"}${x(p.at).toFixed(1)} ${y(p.value).toFixed(1)}`)
          .join(" ");
        const area = `${d} L${x(s.points[s.points.length - 1].at).toFixed(1)} ${height - padB} L${x(
          s.points[0].at,
        ).toFixed(1)} ${height - padB} Z`;
        return (
          <g key={si}>
            {s.fill ? <path d={area} fill={s.color} opacity={0.07} /> : null}
            <path
              d={d}
              fill="none"
              stroke={s.color}
              strokeWidth={1.6}
              strokeDasharray={s.dashed ? "4 3" : undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        );
      })}

      {labelPoints.map((p) => (
        <text key={p.at} x={x(p.at)} y={height - 6} className={styles.axis} textAnchor="middle">
          {new Date(p.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
        </text>
      ))}
    </svg>
  );
}
