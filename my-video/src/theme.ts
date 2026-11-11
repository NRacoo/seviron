import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

/** Mirrors the brand palette in perisai/web `src/app/globals.css`. */
export const theme = {
  font: fontFamily,
  mono: '"SF Mono", "JetBrains Mono", Menlo, ui-monospace, monospace',

  royal: "#0056ff",
  azure: "#2277ff",
  lavender: "#e3e7fc",
  midnight: "#0a1733",

  canvas: "#fafbfe",
  surface: "#ffffff",
  surfaceSunk: "#f6f8fd",
  line: "#e7eaf4",
  lineStrong: "#d4daec",

  ink: "#0b1221",
  ink2: "#3f4860",
  ink3: "#78819a",

  ok: "#2f7d62",
  warn: "#9a6a18",
  high: "#a8521f",
  crit: "#9e2b2b",
} as const;
