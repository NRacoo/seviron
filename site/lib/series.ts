export type Point = { hour: number; value: number };

/**
 * Deterministic 24h observed + 24h forecast series.
 * Observed ends at `observedEnd`; forecast peaks at `forecastPeak` on `peakHour`.
 */
export function buildSeries(opts: {
  observedEnd: number;
  forecastPeak: number;
  peakHour: number;
}): { observed: Point[]; forecast: Point[] } {
  const { observedEnd, forecastPeak, peakHour } = opts;
  const base = observedEnd * 0.62;

  const observed: Point[] = Array.from({ length: 24 }, (_, i) => {
    const t = i / 23;
    const diurnal = Math.sin((i / 24) * Math.PI * 2 - Math.PI / 2) * 0.12 + 0.12;
    const drift = base + (observedEnd - base) * Math.pow(t, 1.4);
    return { hour: i - 23, value: round(drift * (1 + diurnal * 0.5)) };
  });
  observed[observed.length - 1] = { hour: 0, value: round(observedEnd) };

  const forecast: Point[] = Array.from({ length: 25 }, (_, i) => {
    if (i === 0) return { hour: 0, value: round(observedEnd) };
    const d = i - peakHour;
    const bell = Math.exp(-(d * d) / (2 * 3.2 * 3.2));
    const decay = base * (1 - 0.18 * Math.min(1, i / 24));
    return { hour: i, value: round(decay + (forecastPeak - decay) * bell) };
  });
  forecast[peakHour] = { hour: peakHour, value: round(forecastPeak) };

  return { observed, forecast };
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}

export function pathFrom(points: Point[], box: { w: number; h: number }, domain: { min: number; max: number; x0: number; x1: number }) {
  return points
    .map((p, i) => {
      const x = ((p.hour - domain.x0) / (domain.x1 - domain.x0)) * box.w;
      const y = box.h - ((p.value - domain.min) / (domain.max - domain.min)) * box.h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}
