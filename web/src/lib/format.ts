import type { Severity } from "@/types/decision";

export const severityLabel: Record<Severity, string> = {
  good: "Within limit",
  moderate: "Watch",
  high: "Above limit",
  danger: "Critical",
};

export const severityColor: Record<Severity, string> = {
  good: "var(--ok)",
  moderate: "var(--warn)",
  high: "var(--high)",
  danger: "var(--crit)",
};

export function num(v: number): string {
  if (Math.abs(v) >= 1000) return Math.round(v).toLocaleString("en-US");
  return String(Math.round(v * 10) / 10);
}

export function signed(v: number): string {
  const n = num(Math.abs(v));
  return v >= 0 ? `+${n}` : `-${n}`;
}

export function hour(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

/**
 * Jakarta is the operating context, so readings are always shown in WIB
 * regardless of where the server or the reader happens to be.
 */
const WIB = "Asia/Jakarta";

export function wibClock(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: WIB,
  });
}

export function wibHour(iso: string): string {
  return `${new Date(iso).toLocaleString("en-GB", {
    hour: "2-digit",
    hour12: false,
    timeZone: WIB,
  })}:00`;
}

/** Hour-of-day in Jakarta time, for "peak window" copy. */
export function wibHourOf(iso: string): number {
  return Number(
    new Date(iso).toLocaleString("en-GB", {
      hour: "2-digit",
      hour12: false,
      timeZone: WIB,
    }),
  );
}

export function wibDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: WIB,
  });
}

export function wibDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: WIB,
  });
}

export function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function datetime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ago(iso: string): string {
  const secs = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 90) return `${Math.round(secs)}s ago`;
  if (secs < 5400) return `${Math.round(secs / 60)}m ago`;
  return `${Math.round(secs / 3600)}h ago`;
}
