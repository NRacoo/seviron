import type { Point } from "@/types/decision";

export function Spark({
  points,
  color,
  width = 88,
  height = 26,
}: {
  points: Point[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (points.length < 2) return null;
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals);
  const span = Math.max(...vals) - min || 1;

  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - 3 - ((p.value - min) / span) * (height - 6);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden focusable="false">
      <path d={d} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
