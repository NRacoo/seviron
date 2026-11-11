/**
 * Presentation helpers for the ISPU scale (Permen LHK 14/2020).
 *
 * The dashboard's desaturated status palette is used for panels and text, but
 * map markers need literal colours — CSS variables cannot be read from the
 * inline styles MapLibre applies to marker elements.
 */

import type { Severity } from "@/types/jakarta";

/**
 * ISPU bands per Permen LHK 14/2020. The portal's Indonesian labels are mapped
 * onto the four severity tones already used across the dashboard.
 */
export function ispuSeverity(ispu: number): Severity {
  if (ispu <= 50) return "good";
  if (ispu <= 100) return "moderate";
  if (ispu <= 200) return "high";
  return "danger";
}

export function ispuLabel(ispu: number): string {
  if (ispu <= 50) return "Baik";
  if (ispu <= 100) return "Sedang";
  if (ispu <= 200) return "Tidak Sehat";
  if (ispu <= 300) return "Sangat Tidak Sehat";
  return "Berbahaya";
}

export const ispuColor: Record<Severity, string> = {
  good: "#2f7d62",
  moderate: "#9a6a18",
  high: "#a8521f",
  danger: "#9e2b2b",
};

export const ispuBandLabel: Record<Severity, string> = {
  good: "Baik",
  moderate: "Sedang",
  high: "Tidak Sehat",
  danger: "Sangat Tidak Sehat",
};

export const ispuBandRange: Record<Severity, string> = {
  good: "0–50",
  moderate: "51–100",
  high: "101–200",
  danger: "201+",
};

export const ispuBands: Severity[] = ["good", "moderate", "high", "danger"];

/** Pollutant codes to display form, e.g. "PM25" → "PM2.5". */
export function pollutantLabel(code: string): string {
  const map: Record<string, string> = {
    PM25: "PM2.5",
    PM10: "PM10",
    SO2: "SO₂",
    NO2: "NO₂",
    CO: "CO",
    O3: "O₃",
  };
  return map[code.toUpperCase()] ?? code;
}

/** Operational guidance shown alongside a reading. */
export function ispuAdvice(severity: Severity): string {
  switch (severity) {
    case "good":
      return "Normal operations. No exposure controls required.";
    case "moderate":
      return "Acceptable. Monitor sensitive workers on extended outdoor shifts.";
    case "high":
      return "Outdoor crews need respirators. Consider rotating long shifts.";
    case "danger":
      return "Suspend non-essential outdoor work and log the decision.";
  }
}
