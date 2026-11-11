/**
 * Live air quality for DKI Jakarta, sourced from the city's official portal at
 * udara.jakarta.go.id.
 *
 * The portal is a server-rendered page, not a JSON API: the station readings
 * are embedded in the HTML as `window.__SPKU_DATA__` and the SILAM forecast as
 * `window.__SILAM_DATA__`. We therefore fetch the page and extract those two
 * blobs. This is deliberate and documented rather than hidden — if the portal
 * ever ships a real API, only this module needs to change.
 */

import { BROWSER_HEADERS, extractAssigned, parseJakartaTime } from "@/lib/html";
import { ispuLabel, ispuSeverity } from "@/lib/ispu";
import type {
  JakartaForecastDay,
  JakartaSnapshot,
  JakartaStation,
} from "@/types/jakarta";

const SOURCE = "https://udara.jakarta.go.id/";

/** Revalidation window. The portal itself updates roughly every 30 minutes. */
const TTL_SECONDS = 600;

/** Raw station shape as embedded by the portal. */
interface RawStation {
  id: string;
  name: string;
  initial: string | null;
  datasourceName: string | null;
  area: string | null;
  kecamatan: string | null;
  kota: string | null;
  lat: number;
  lng: number;
  ispu: number | null;
  status: string | null;
  dominantMetric: string | null;
  dominantRawValue: number | null;
  temperature: number | null;
  humidity: number | null;
  wind: number | null;
  windDirection: number | null;
  isActive: boolean;
  dominantMetricTime: string | null;
}

interface RawSilam {
  currentMeteo?: {
    temperature: number | null;
    relativeHumidity: number | null;
    windSpeed: number | null;
    windDirectionText: string | null;
    rainfall: number | null;
    heatIndex: number | null;
  } | null;
  forecastDays?: {
    label: string;
    date: string;
    dateIso: string;
    ispu: number;
    status: string;
    isWarning: boolean;
    warningHours?: { time: string; ispu: number }[];
  }[];
}


/** "Kota Adm. Jakarta Barat" → "Jakarta Barat". */
function shortCity(kota: string | null): string {
  if (!kota) return "Jakarta";
  return kota.replace(/^Kota(\s+Adm\.)?\s+/i, "").replace(/^Kab\.\s+Adm\.\s+/i, "");
}

/**
 * Station names arrive prefixed with their internal feed id, e.g.
 * "DKI_PM25_64 SMPN 88 Jakarta (ROOFTOP)". The portal shows `datasourceName`,
 * so we prefer that and fall back to stripping the prefix.
 */
function displayName(raw: RawStation): string {
  if (raw.datasourceName) return raw.datasourceName;
  return raw.name.replace(/^DKI[_A-Z0-9]*\s+/i, "").trim() || raw.name;
}

/** Mainland DKI only — Kepulauan Seribu sits far north and skews the viewport. */
function isMainland(raw: RawStation): boolean {
  return raw.lat > -6.5 && raw.lat < -6.0;
}

function toStation(raw: RawStation): JakartaStation | null {
  if (raw.ispu === null || !Number.isFinite(raw.ispu)) return null;

  return {
    id: raw.id,
    name: displayName(raw),
    code: raw.initial ?? "",
    city: shortCity(raw.kota),
    district: raw.kecamatan ?? "",
    lat: raw.lat,
    lon: raw.lng,
    ispu: Math.round(raw.ispu),
    severity: ispuSeverity(raw.ispu),
    status: raw.status ?? ispuLabel(raw.ispu),
    dominant: raw.dominantMetric ?? "PM25",
    dominantValue: raw.dominantRawValue,
    temperature: raw.temperature,
    humidity: raw.humidity,
    wind: raw.wind,
    measuredAt: parseJakartaTime(raw.dominantMetricTime)?.toISOString() ?? null,
    offshore: !isMainland(raw),
  };
}

function toForecast(silam: RawSilam | null): JakartaForecastDay[] {
  if (!silam?.forecastDays) return [];

  return silam.forecastDays.map((d) => ({
    label: d.label,
    date: d.date,
    dateIso: d.dateIso,
    ispu: d.ispu,
    status: d.status,
    severity: ispuSeverity(d.ispu),
    isWarning: d.isWarning,
    hours: (d.warningHours ?? []).map((h) => ({
      time: h.time.replace(".", ":"),
      ispu: h.ispu,
    })),
  }));
}

/** Fetches and normalises the current Jakarta air quality snapshot. */
export async function getJakartaAir(): Promise<JakartaSnapshot> {
  const res = await fetch(SOURCE, {
    headers: BROWSER_HEADERS,
    next: { revalidate: TTL_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`udara.jakarta.go.id responded ${res.status}`);
  }

  const html = await res.text();

  const rawStations = extractAssigned<RawStation[]>(
    html,
    "window.__SPKU_DATA__",
    "[",
  );
  if (!rawStations?.length) {
    throw new Error("Could not read station data from udara.jakarta.go.id");
  }

  const silam = extractAssigned<RawSilam>(html, "window.__SILAM_DATA__", "{");

  const updatedMatch = html.match(
    /window\.__SPKU_UPDATE_TIME__\s*=\s*"([^"]+)"/,
  );

  const stations = rawStations
    .filter((s) => s.isActive)
    .map(toStation)
    .filter((s): s is JakartaStation => s !== null)
    .sort((a, b) => b.ispu - a.ispu);

  const mainland = stations.filter((s) => !s.offshore);
  const scored = mainland.length ? mainland : stations;

  const mean =
    scored.reduce((acc, s) => acc + s.ispu, 0) / Math.max(scored.length, 1);

  const byCity = new Map<string, { total: number; count: number }>();
  for (const s of scored) {
    const entry = byCity.get(s.city) ?? { total: 0, count: 0 };
    entry.total += s.ispu;
    entry.count += 1;
    byCity.set(s.city, entry);
  }

  const meteo = silam?.currentMeteo ?? null;

  return {
    stations,
    forecast: toForecast(silam),
    updatedAt: updatedMatch?.[1] ?? null,
    source: SOURCE,
    meteo: meteo
      ? {
          temperature: meteo.temperature,
          humidity: meteo.relativeHumidity,
          windSpeed: meteo.windSpeed,
          windDirection: meteo.windDirectionText,
          rainfall: meteo.rainfall,
          heatIndex: meteo.heatIndex,
        }
      : null,
    summary: {
      total: scored.length,
      worst: scored[0] ?? null,
      mean: Math.round(mean),
      meanSeverity: ispuSeverity(mean),
      unhealthy: scored.filter((s) => s.ispu > 100).length,
      moderate: scored.filter((s) => s.ispu > 50 && s.ispu <= 100).length,
      good: scored.filter((s) => s.ispu <= 50).length,
      cities: [...byCity.entries()]
        .map(([city, v]) => ({
          city,
          mean: Math.round(v.total / v.count),
          count: v.count,
        }))
        .sort((a, b) => b.mean - a.mean),
    },
  };
}
