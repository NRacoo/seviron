/**
 * Per-station detail from udara.jakarta.go.id/spku/:id.
 *
 * The station page embeds a `SPKU_DETAIL_DATA` blob that is far richer than the
 * landing page summary: seven measurands with 48 h of half-hourly history,
 * hourly ISPU, a three-day forecast with hourly detail, and 31 days of daily
 * peaks. Every page beyond the map is built on this.
 */

import { BROWSER_HEADERS, extractAssigned, parseJakartaTime } from "@/lib/html";
import { ispuSeverity } from "@/lib/ispu";
import type {
  DailyIspu,
  JakartaForecastDay,
  SeriesPoint,
  Severity,
  StationDetail,
  StationMetric,
} from "@/types/jakarta";

const ORIGIN = "https://udara.jakarta.go.id";

/** Station readings advance every 30 minutes; cache for half that. */
const TTL_SECONDS = 900;

interface RawMetric {
  metricID: number;
  metricName: string;
  parameterName: string;
  currentIspu: number | null;
  currentRaw: number | null;
  history: { time: string; value: number | null }[] | null;
}

interface RawForecastDay {
  label: string;
  date: string;
  icon: string | null;
  ispu: number;
  category: string;
  warningHours: { time: string; ispu: number }[] | null;
}

interface RawDetail {
  datasourceID: string;
  datasourceKode: string | null;
  datasourceName: string;
  kecamatanNama: string | null;
  kotaKabupatenNama: string | null;
  alamat: string | null;
  dioperasikan: string | null;
  type: string | null;
  latitude: number;
  longitude: number;
  lastUpdate: string | null;
  ispuValue: number | null;
  ispuCategory: string | null;
  ispuParameter: string | null;
  metrics: RawMetric[] | null;
  ispuHistory: { time: string; value: number | null; metricName: string }[] | null;
  dailyIspu30Days:
    | {
        date: string;
        maxIspu: number | null;
        dominantMetric: string | null;
        concentration: number | null;
      }[]
    | null;
  forecast: RawForecastDay[] | null;
}

/**
 * Display metadata per measurand.
 *
 * `limit` for the three pollutants is the 24-hour ambient standard in
 * PP 22/2021 Annex VII. The meteorological rows carry advisory thresholds for
 * heat and wind-driven dust instead — flagged `regulated: false` so the UI can
 * distinguish a legal breach from an operational one.
 */
const METRICS: Record<
  string,
  { label: string; unit: string; limit: number | null; regulated: boolean }
> = {
  PM25: { label: "PM2.5", unit: "µg/m³", limit: 55, regulated: true },
  PM10: { label: "PM10", unit: "µg/m³", limit: 75, regulated: true },
  SO2: { label: "SO₂", unit: "µg/m³", limit: 75, regulated: true },
  NO2: { label: "NO₂", unit: "µg/m³", limit: 65, regulated: true },
  CO: { label: "CO", unit: "µg/m³", limit: 4000, regulated: true },
  O3: { label: "O₃", unit: "µg/m³", limit: 100, regulated: true },
  AT: { label: "Temperature", unit: "°C", limit: 35, regulated: false },
  AIR_HUMID: { label: "Humidity", unit: "%", limit: null, regulated: false },
  SOLAR_RAD: { label: "Solar radiation", unit: "W/m²", limit: null, regulated: false },
  RAIN: { label: "Rainfall", unit: "mm", limit: null, regulated: false },
  WIND_SPEED: { label: "Wind speed", unit: "m/s", limit: 8, regulated: false },
  WIND_DIR1: { label: "Wind direction", unit: "°", limit: null, regulated: false },
};

export function metricLabel(code: string): string {
  return METRICS[code]?.label ?? code;
}

export function metricUnit(code: string): string {
  return METRICS[code]?.unit ?? "";
}

/** Pollutants carry an ISPU; the rest are context for interpreting them. */
export function isPollutant(code: string): boolean {
  return METRICS[code]?.regulated ?? false;
}

/**
 * The portal's history arrays arrive unsorted — half-hourly samples appear
 * interleaved across days. Everything downstream (charts, deltas, "latest
 * reading") assumes chronological order, so sort on the way in.
 */
function toSeries(raw: { time: string; value: number | null }[] | null): SeriesPoint[] {
  if (!raw) return [];

  return raw
    .flatMap((p) => {
      if (typeof p.value !== "number") return [];

      const at = parseJakartaTime(p.time);
      return at ? [{ at: at.toISOString(), value: p.value }] : [];
    })
    .sort((a, b) => a.at.localeCompare(b.at));
}

/**
 * Severity for a non-ISPU measurand, as a fraction of its advisory threshold.
 * Metrics with no meaningful threshold are always reported as nominal.
 */
function metricSeverity(value: number | null, limit: number | null): Severity {
  if (value === null || limit === null) return "good";
  const ratio = value / limit;
  if (ratio >= 1.25) return "danger";
  if (ratio >= 1) return "high";
  if (ratio >= 0.8) return "moderate";
  return "good";
}

function toMetric(raw: RawMetric): StationMetric {
  const meta = METRICS[raw.metricName] ?? {
    label: raw.parameterName || raw.metricName,
    unit: "",
    limit: null,
    regulated: false,
  };

  const history = toSeries(raw.history);
  const values = history.map((p) => p.value);

  // Prefer the portal's current reading, falling back to the newest sample.
  const now = raw.currentRaw ?? history.at(-1)?.value ?? null;

  const severity =
    raw.currentIspu !== null
      ? ispuSeverity(raw.currentIspu)
      : metricSeverity(now, meta.limit);

  const first = values[0];
  const last = values.at(-1);

  return {
    code: raw.metricName,
    label: meta.label,
    unit: meta.unit,
    now,
    ispu: raw.currentIspu,
    history,
    min: values.length ? Math.min(...values) : null,
    max: values.length ? Math.max(...values) : null,
    mean: values.length ? values.reduce((a, v) => a + v, 0) / values.length : null,
    limit: meta.limit,
    regulated: meta.regulated,
    severity,
    delta: first !== undefined && last !== undefined ? last - first : 0,
  };
}

/** "KOTA ADM. JAKARTA UTARA" → "Jakarta Utara". */
function titleCity(kota: string | null): string {
  if (!kota) return "Jakarta";
  const stripped = kota
    .replace(/^KOTA(\s+ADM\.)?\s+/i, "")
    .replace(/^KAB\.\s+ADM\.\s+/i, "")
    .toLowerCase();
  return stripped.replace(/\b\w/g, (c) => c.toUpperCase());
}

function titleCase(s: string | null): string {
  if (!s) return "";
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

const MONTHS_ID = [
  "januari",
  "februari",
  "maret",
  "april",
  "mei",
  "juni",
  "juli",
  "agustus",
  "september",
  "oktober",
  "november",
  "desember",
];

/**
 * Converts the portal's "12 November 2026" into a plain "2026-11-12".
 *
 * Returning a date string rather than a `Date` keeps the zone decision in one
 * place: callers combine it with an hour and resolve it through
 * `parseJakartaTime`, so the result never depends on the server's zone.
 */
function indonesianDateToYmd(s: string): string | null {
  const m = /^(\d{1,2})\s+(\S+)\s+(\d{4})$/.exec(s.trim());
  if (!m) return null;

  const month = MONTHS_ID.indexOf(m[2].toLowerCase());
  if (month === -1) return null;

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${m[3]}-${pad(month + 1)}-${pad(Number(m[1]))}`;
}

function toForecast(raw: RawForecastDay[] | null): JakartaForecastDay[] {
  if (!raw) return [];

  return raw.map((d) => ({
    label: d.label,
    date: d.date,
    dateIso: indonesianDateToYmd(d.date) ?? d.date,
    ispu: d.ispu,
    status: d.category,
    severity: ispuSeverity(d.ispu),
    isWarning: d.ispu > 100,
    hours: (d.warningHours ?? []).map((h) => ({
      // The portal writes hours as "09.00".
      time: h.time.replace(".", ":"),
      ispu: h.ispu,
    })),
  }));
}

function toDaily(raw: RawDetail["dailyIspu30Days"]): DailyIspu[] {
  if (!raw) return [];

  return raw
    .filter((d): d is typeof d & { maxIspu: number } => typeof d.maxIspu === "number")
    .map((d) => ({
      date: d.date,
      ispu: d.maxIspu,
      severity: ispuSeverity(d.maxIspu),
      dominant: d.dominantMetric ?? "PM25",
      concentration: d.concentration,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Fetches and normalises one station's full detail payload. */
export async function getStationDetail(id: string): Promise<StationDetail> {
  const url = `${ORIGIN}/spku/${encodeURIComponent(id)}`;

  const res = await fetch(url, {
    headers: BROWSER_HEADERS,
    next: { revalidate: TTL_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`udara.jakarta.go.id/spku responded ${res.status}`);
  }

  const html = await res.text();
  const raw = extractAssigned<RawDetail>(html, "SPKU_DETAIL_DATA", "{");

  if (!raw) {
    throw new Error(`Could not read station detail for ${id}`);
  }

  const ispu = raw.ispuValue ?? 0;
  const dominant = raw.ispuParameter ?? "PM25";

  const metrics = (raw.metrics ?? [])
    .map(toMetric)
    // Pollutants first, then meteorology; both alphabetical within group.
    .sort((a, b) => {
      if (a.regulated !== b.regulated) return a.regulated ? -1 : 1;
      return a.label.localeCompare(b.label);
    });

  const forecast = toForecast(raw.forecast);

  // Hourly forecast flattened into one continuous series for charting. The
  // chart plots a real time axis, so each hour is resolved to an absolute
  // timestamp from its day's Indonesian date plus the hour-of-day label.
  const forecastHours: SeriesPoint[] = forecast.flatMap((day) => {
    const ymd = indonesianDateToYmd(day.date);
    if (!ymd) return [];

    return day.hours.flatMap((h) => {
      const hh = h.time.slice(0, 2);
      if (!/^\d{2}$/.test(hh)) return [];

      const at = parseJakartaTime(`${ymd}T${hh}:00:00`);
      return at ? [{ at: at.toISOString(), value: h.ispu }] : [];
    });
  });

  return {
    id: raw.datasourceID,
    code: raw.datasourceKode ?? "",
    name: raw.datasourceName,
    district: titleCase(raw.kecamatanNama),
    city: titleCity(raw.kotaKabupatenNama),
    address: raw.alamat,
    operator: raw.dioperasikan,
    type: raw.type,
    lat: raw.latitude,
    lon: raw.longitude,
    updatedAt: parseJakartaTime(raw.lastUpdate)?.toISOString() ?? null,
    ispu,
    severity: ispuSeverity(ispu),
    status: raw.ispuCategory ?? "",
    dominant,
    dominantLabel: metricLabel(dominant),
    metrics,
    ispuHistory: toSeries(raw.ispuHistory),
    forecast,
    forecastHours,
    daily: toDaily(raw.dailyIspu30Days),
    source: url,
  };
}
