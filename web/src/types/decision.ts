/**
 * View models shared by the component library.
 *
 * These describe what the UI renders, not where it came from: the adapters in
 * `lib/adapt.ts` map the live Jakarta feed onto these shapes, which keeps the
 * presentational components independent of the upstream data source.
 */

export type Severity = "good" | "moderate" | "high" | "danger";

export interface Point {
  at: string;
  value: number;
}

/** One measurand, as rendered by `MetricTile` and `ForecastExplorer`. */
export interface ParameterCard {
  parameter: string;
  label: string;
  unit: string;
  /** Provenance line, e.g. "DLH Jakarta · SPKU". */
  vendor: string;
  now: number;
  /**
   * The comparison reading. This is a genuine projection when `projected` is
   * true, and the peak of the observed window otherwise — the UI labels the
   * two differently so a measured high is never shown as a prediction.
   */
  forecast: number;
  /** False when `forecast` is an observed peak rather than a projection. */
  projected?: boolean;
  /** Hour of day (WIB) at which `forecast` occurs. */
  peak_hour: number;
  delta: number;
  limit: number;
  severity: Severity;
  at_risk: boolean;
  history: Point[];
  trend: Point[];
}

/** A proposed operational control, as rendered by `ActionQueue`. */
export interface Action {
  id: string;
  label: string;
  detail: string;
  owner: string;
  window: string;
  /** True when the current air quality band calls for this control. */
  enabled: boolean;
  /** The reading that triggers it, e.g. "ISPU 160 exceeds 100". */
  driver: string;
  /** Governing standard, e.g. "PP 22/2021". */
  reference: string;
}

/** A parameter's performance over the reporting window. */
export interface ESGMetric {
  parameter: string;
  label: string;
  unit: string;
  mean: number;
  peak: number;
  limit: number;
  exceeded_hours: number;
  status: Severity;
}
