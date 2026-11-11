/** Types for the live DKI Jakarta air quality feed. */

export type Severity = "good" | "moderate" | "high" | "danger";

export interface JakartaStation {
  id: string;
  /** Human-readable site, e.g. "SMPN 88 Jakarta (ROOFTOP)". */
  name: string;
  /** Portal's short code, e.g. "DKI92". */
  code: string;
  /** Administrative city, e.g. "Jakarta Barat". */
  city: string;
  district: string;
  lat: number;
  lon: number;
  ispu: number;
  severity: Severity;
  /** Indonesian band label from the portal, e.g. "Tidak Sehat". */
  status: string;
  /** Pollutant driving the index, e.g. "PM25". */
  dominant: string;
  /** Raw concentration of the dominant pollutant, µg/m³. */
  dominantValue: number | null;
  temperature: number | null;
  humidity: number | null;
  wind: number | null;
  measuredAt: string | null;
  /** Kepulauan Seribu sits outside the mainland viewport. */
  offshore: boolean;
}

export interface JakartaForecastHour {
  time: string;
  ispu: number;
}

export interface JakartaForecastDay {
  label: string;
  date: string;
  dateIso: string;
  ispu: number;
  status: string;
  severity: Severity;
  isWarning: boolean;
  hours: JakartaForecastHour[];
}

export interface JakartaMeteo {
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  windDirection: string | null;
  rainfall: number | null;
  heatIndex: number | null;
}

export interface JakartaCityMean {
  city: string;
  mean: number;
  count: number;
}

export interface JakartaSummary {
  total: number;
  worst: JakartaStation | null;
  mean: number;
  meanSeverity: Severity;
  unhealthy: number;
  moderate: number;
  good: number;
  cities: JakartaCityMean[];
}

export interface JakartaSnapshot {
  stations: JakartaStation[];
  forecast: JakartaForecastDay[];
  updatedAt: string | null;
  source: string;
  meteo: JakartaMeteo | null;
  summary: JakartaSummary;
}

/* ------------------------------------------------------------------ *
 * Per-station detail (udara.jakarta.go.id/spku/:id)
 * ------------------------------------------------------------------ */

export interface SeriesPoint {
  at: string;
  value: number;
}

/**
 * One measurand on a station, with its 48-hour observed series.
 *
 * `limit` is the regulatory threshold where one exists (pollutants, per
 * Permen LHK 14/2020) and an advisory threshold otherwise — `regulated`
 * says which, so the UI never implies a legal limit that does not exist.
 */
export interface StationMetric {
  /** Portal metric code, e.g. "PM25", "AT". */
  code: string;
  label: string;
  unit: string;
  /** Latest raw reading. */
  now: number | null;
  /** ISPU for this metric, when the portal computes one. */
  ispu: number | null;
  /** Observed series, oldest first. */
  history: SeriesPoint[];
  min: number | null;
  max: number | null;
  mean: number | null;
  limit: number | null;
  regulated: boolean;
  severity: Severity;
  /** Change between the first and last reading in the window. */
  delta: number;
}

export interface DailyIspu {
  date: string;
  ispu: number;
  severity: Severity;
  dominant: string;
  concentration: number | null;
}

export interface StationDetail {
  id: string;
  code: string;
  name: string;
  district: string;
  city: string;
  address: string | null;
  operator: string | null;
  type: string | null;
  lat: number;
  lon: number;
  updatedAt: string | null;
  ispu: number;
  severity: Severity;
  status: string;
  /** Pollutant driving the index. */
  dominant: string;
  dominantLabel: string;
  metrics: StationMetric[];
  /** 48 h of observed hourly ISPU, oldest first. */
  ispuHistory: SeriesPoint[];
  /** H+1..H+3, each with hourly detail. */
  forecast: JakartaForecastDay[];
  /** Flattened hourly forecast across all days, for charting. */
  forecastHours: SeriesPoint[];
  /** 31 days of daily peak ISPU. */
  daily: DailyIspu[];
  source: string;
}
