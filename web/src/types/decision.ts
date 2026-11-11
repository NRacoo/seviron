export type Severity = "good" | "moderate" | "high" | "danger";

export interface Point {
  at: string;
  value: number;
}

export interface Sensor {
  device_id: string;
  name: string;
  vendor: string;
  station: string;
  placement: string;
  parameters: string[];
  online: boolean;
  uptime: number;
  last_seen: string;
}

export interface SensorFleet {
  station: string;
  total: number;
  online: number;
  sensors: Sensor[];
}

export interface Site {
  name: string;
  region: string;
  lat: number;
  lon: number;
  category: string;
}

export interface SiteMarker {
  name: string;
  region: string;
  category: string;
  lat: number;
  lon: number;
  risk_score: number;
  risk_level: Severity;
  risk_label: string;
  at_risk_count: number;
  total_params: number;
  headline: string;
  driver: string;
  driver_value: number;
  driver_unit: string;
  peak_hour: number;
  online: boolean;
}

export interface MapSummary {
  total: number;
  at_risk: number;
  critical: number;
  mean_risk: number;
}

export interface SiteMap {
  generated_at: string;
  horizon: string;
  country: string;
  sites: SiteMarker[];
  summary: MapSummary;
}

export interface ParameterCard {
  parameter: string;
  label: string;
  unit: string;
  vendor: string;
  now: number;
  forecast: number;
  peak_hour: number;
  delta: number;
  limit: number;
  severity: Severity;
  at_risk: boolean;
  history: Point[];
  trend: Point[];
}

export interface Insight {
  parameter: string;
  label: string;
  text: string;
  hour: number;
  severity: Severity;
}

export interface Action {
  id: string;
  label: string;
  detail: string;
  owner: string;
  window: string;
  enabled: boolean;
  driver: string;
  reference: string;
}

export interface Decision {
  station: string;
  generated_at: string;
  horizon: string;
  cards: ParameterCard[];
  insights: Insight[];
  actions: Action[];
  risk_score: number;
  risk_label: string;
  risk_level: Severity;
  at_risk_count: number;
  total_params: number;
  live: boolean;
}

export interface ForecastBundle {
  station: string;
  horizon: string;
  generated_at: string;
  cards: ParameterCard[];
}

export interface ActionBundle {
  station: string;
  risk_score: number;
  risk_label: string;
  actions: Action[];
  insights: Insight[];
}

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

export interface AuditEntry {
  ref: string;
  at: string;
  action: string;
  actor: string;
  result: string;
}

export interface ESGReport {
  station: string;
  period: string;
  generated_at: string;
  compliance_rate: number;
  metrics: ESGMetric[];
  audit: AuditEntry[];
  frameworks: string[];
}
