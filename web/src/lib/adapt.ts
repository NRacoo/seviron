/**
 * Adapters from the live Jakarta feed onto the view models the dashboard's
 * components already speak (`ParameterCard`, `Action`, `ESGMetric`).
 *
 * This keeps the component library untouched: the pages change data source
 * without the presentational layer knowing where readings come from.
 *
 * One deliberate constraint runs through this file. The portal publishes a
 * forecast as **ISPU only** — there is no per-pollutant concentration
 * forecast. Rather than invent one by inverting the ISPU breakpoint table
 * (which does not round-trip), per-metric cards report the observed window
 * and the station's ISPU forecast is presented separately. Nothing here
 * synthesises a number the source did not provide.
 */

import { wibHourOf } from "@/lib/format";
import { ispuSeverity } from "@/lib/ispu";
import type { Action, ESGMetric, ParameterCard, Point } from "@/types/decision";
import type {
  DailyIspu,
  JakartaStation,
  SeriesPoint,
  Severity,
  StationDetail,
  StationMetric,
} from "@/types/jakarta";

const toPoints = (s: SeriesPoint[]): Point[] =>
  s.map((p) => ({ at: p.at, value: p.value }));

/**
 * Hour-of-day of the highest reading in a series, for "peak window" copy.
 * Readings are absolute instants, but operators reason in WIB, so peak
 * windows are always reported in local site time.
 */
function peakHour(series: SeriesPoint[]): number {
  if (!series.length) return wibHourOf(new Date().toISOString());

  const peak = series.reduce((a, b) => (b.value > a.value ? b : a));
  return wibHourOf(peak.at);
}

/**
 * A station metric as a `ParameterCard`.
 *
 * `now` is the latest reading and `forecast` the peak of the observed window —
 * i.e. the worst the metric actually reached, not a projection. The caller
 * labels this honestly ("window peak", not "forecast peak").
 */
export function metricToCard(m: StationMetric): ParameterCard {
  const history = toPoints(m.history);

  // Trend = the most recent quarter of the window, enough for a sparkline to
  // show direction without flattening out over two full days.
  const trend = history.slice(-Math.max(2, Math.ceil(history.length / 4)));

  const now = m.now ?? 0;
  const windowPeak = m.max ?? now;

  return {
    parameter: m.code,
    label: m.label,
    unit: m.unit,
    vendor: m.regulated ? "DLH Jakarta · SPKU" : "DLH Jakarta · meteorology",
    now,
    forecast: windowPeak,
    // The portal forecasts the index only, never per-pollutant
    // concentrations, so this is the observed peak of the window.
    projected: false,
    peak_hour: peakHour(m.history),
    delta: m.delta,
    // Components divide by `limit`; unregulated metrics get the observed peak
    // so the ratio stays finite and never implies a legal threshold.
    limit: m.limit ?? Math.max(windowPeak, 1),
    severity: m.severity,
    at_risk: m.limit !== null && windowPeak > m.limit,
    history,
    trend,
  };
}

/** Station ISPU — observed 48 h against the H+1..H+3 forecast. */
export function ispuToCard(d: StationDetail): ParameterCard {
  const history = toPoints(d.ispuHistory);
  const forecast = toPoints(d.forecastHours);
  const peak = forecast.length
    ? forecast.reduce((a, b) => (b.value > a.value ? b : a))
    : null;

  return {
    parameter: "ispu",
    label: "ISPU",
    unit: "index",
    vendor: `SILAM · dominant ${d.dominantLabel}`,
    now: d.ispu,
    forecast: peak?.value ?? d.ispu,
    projected: true,
    peak_hour: peak ? wibHourOf(peak.at) : wibHourOf(new Date().toISOString()),
    delta: (peak?.value ?? d.ispu) - d.ispu,
    // 100 is the "Sedang"/"Tidak Sehat" boundary — the point at which the
    // portal's own guidance starts recommending exposure controls.
    limit: 100,
    severity: d.severity,
    at_risk: (peak?.value ?? d.ispu) > 100,
    history,
    trend: forecast,
  };
}

/* ------------------------------------------------------------------ *
 * Risk
 * ------------------------------------------------------------------ */

export interface RiskVerdict {
  score: number;
  label: string;
  level: Severity;
}

/**
 * Operational risk index, 0-100.
 *
 * Driven by the worse of the current and forecast ISPU, so a clean "now" with
 * a bad afternoon ahead still raises the index. ISPU 300+ (Berbahaya) maps to
 * 100; the scale is linear below that.
 */
export function riskFromStation(d: StationDetail): RiskVerdict {
  const peak = d.forecastHours.reduce((a, p) => Math.max(a, p.value), 0);
  const driver = Math.max(d.ispu, peak);
  const score = Math.min(100, Math.round((driver / 300) * 100));
  const level = ispuSeverity(driver);

  const label =
    level === "good"
      ? "Normal operations. No exposure controls required."
      : level === "moderate"
        ? `Acceptable air quality, peaking at ISPU ${peak || d.ispu}. Monitor sensitive workers on extended outdoor shifts.`
        : level === "high"
          ? `${d.dominantLabel} is above the healthy limit at ISPU ${driver}. Outdoor crews need respiratory protection.`
          : `Hazardous exposure at ISPU ${driver}. Suspend non-essential outdoor work and log the decision.`;

  return { score, label, level };
}

/* ------------------------------------------------------------------ *
 * Controls
 * ------------------------------------------------------------------ */

/**
 * Operational controls implied by the station's current and forecast band.
 *
 * These are proposals derived from live readings and the thresholds in the
 * cited regulations — not a record of anything that has been carried out.
 * `enabled` marks the ones the current band actually calls for.
 */
export function actionsFromStation(d: StationDetail): Action[] {
  const peak = d.forecastHours.reduce((a, p) => Math.max(a, p.value), 0);
  const driver = Math.max(d.ispu, peak);
  const window = peakWindowLabel(d);

  const actions: Action[] = [
    {
      id: "brief",
      label: "Brief crews on today's air quality",
      detail: `Shift handover to state the current ISPU (${d.ispu}, ${d.status}) and the dominant pollutant (${d.dominantLabel}).`,
      owner: "Shift supervisor",
      window: "Start of shift",
      enabled: true,
      driver: `ISPU ${d.ispu}`,
      reference: "Permen LHK 14/2020",
    },
    {
      id: "monitor",
      label: "Increase monitoring of sensitive workers",
      detail:
        "Workers with asthma or cardiovascular conditions report at mid-shift. Rotate those on continuous outdoor tasks.",
      owner: "Occupational health",
      window: window,
      enabled: driver > 50,
      driver: `ISPU forecast ${peak || d.ispu}`,
      reference: "Permenaker 5/2018",
    },
    {
      id: "ppe",
      label: "Issue N95 respirators to outdoor crews",
      detail: `${d.dominantLabel} is the dominant pollutant. Cloth and surgical masks do not filter fine particulate.`,
      owner: "HSE lead",
      window: window,
      enabled: driver > 100,
      driver: `ISPU ${driver} exceeds 100`,
      reference: "Permenaker 5/2018",
    },
    {
      id: "reschedule",
      label: "Move non-essential outdoor work off the peak window",
      detail: `Shift deferrable outdoor tasks away from ${window}, when exposure is forecast to be worst.`,
      owner: "Operations planner",
      window: window,
      enabled: driver > 100,
      driver: `Forecast peak ISPU ${peak}`,
      reference: "PP 22/2021",
    },
    {
      id: "suspend",
      label: "Suspend outdoor work and log the decision",
      detail:
        "At hazardous levels, outdoor work stops. The decision and its justification are retained for assurance.",
      owner: "Site manager",
      window: "Immediate",
      enabled: driver > 200,
      driver: `ISPU ${driver} in hazardous band`,
      reference: "PP 22/2021",
    },
  ];

  // Surface what the current band calls for; keep the rest visible as standby.
  return actions.sort((a, b) => Number(b.enabled) - Number(a.enabled));
}

/** Human label for the hours around the forecast peak. */
function peakWindowLabel(d: StationDetail): string {
  if (!d.forecastHours.length) return "Next 24 h";

  const peak = d.forecastHours.reduce((a, b) => (b.value > a.value ? b : a));
  const h = wibHourOf(peak.at);
  const pad = (n: number) => String((n + 24) % 24).padStart(2, "0");

  return `${pad(h - 1)}:00–${pad(h + 2)}:00`;
}

/* ------------------------------------------------------------------ *
 * Compliance
 * ------------------------------------------------------------------ */

/**
 * Monthly performance per measurand, from the observed window.
 *
 * `exceeded_hours` counts samples above the limit, scaled to hours — the
 * portal samples every 30 minutes, so two samples make one hour.
 */
export function metricToESG(m: StationMetric): ESGMetric {
  const limit = m.limit;
  const overSamples = limit === null ? 0 : m.history.filter((p) => p.value > limit).length;

  return {
    parameter: m.code,
    label: m.label,
    unit: m.unit,
    mean: m.mean ?? 0,
    peak: m.max ?? 0,
    limit: limit ?? 0,
    exceeded_hours: Math.round(overSamples / 2),
    status: m.severity,
  };
}

/** Share of the 31-day window whose daily peak stayed within the healthy band. */
export function complianceRate(daily: DailyIspu[]): number {
  if (!daily.length) return 100;

  const within = daily.filter((d) => d.ispu <= 100).length;
  return Math.round((within / daily.length) * 1000) / 10;
}

/* ------------------------------------------------------------------ *
 * Station as a monitoring asset
 * ------------------------------------------------------------------ */

/**
 * Whether a station is currently reporting.
 *
 * The portal's own `isActive` only means "commissioned", so freshness is
 * judged from the reading timestamp: the network publishes every 30 minutes,
 * and anything over two hours stale is treated as not reporting.
 */
export function isReporting(station: JakartaStation): boolean {
  if (!station.measuredAt) return false;

  const age = Date.now() - new Date(station.measuredAt).getTime();
  return age < 2 * 60 * 60 * 1000;
}
