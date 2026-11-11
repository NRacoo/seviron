import type {
  ActionBundle,
  Decision,
  ESGReport,
  ForecastBundle,
  SensorFleet,
  Site,
  SiteMap,
} from "@/types/decision";

const BASE = process.env.PERISAI_API ?? "http://localhost:8088";

async function get<T>(path: string, site?: string): Promise<T> {
  const qs = site ? `?site=${encodeURIComponent(site)}` : "";
  const res = await fetch(`${BASE}${path}${qs}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`${path} responded ${res.status}`);
  return res.json() as Promise<T>;
}

export const getSites = () => get<{ sites: Site[] }>("/api/v1/sites").then((r) => r.sites);
export const getSiteMap = () => get<SiteMap>("/api/v1/map");
export const getSensors = (site?: string) => get<SensorFleet>("/api/v1/sensors", site);
export const getForecast = (site?: string) => get<ForecastBundle>("/api/v1/forecast", site);
export const getDecision = (site?: string) => get<Decision>("/api/v1/decision", site);
export const getActions = (site?: string) => get<ActionBundle>("/api/v1/actions", site);
export const getESG = (site?: string) => get<ESGReport>("/api/v1/esg", site);
