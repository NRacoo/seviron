import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { REGIONS, project } from "../geo/indonesia";
import { theme } from "../theme";

/** Anak Krakatau. */
export const VENT = { lon: 105.423, lat: -6.102 };

export type PlumeSite = {
  readonly name: string;
  readonly lon: number;
  readonly lat: number;
  /** Hours until the plume reaches the site. */
  readonly etaHours: number;
  readonly pm25: number;
  readonly tone: string;
  /** Vertical offset of the label stack, staggered to avoid collisions. */
  readonly labelOffset: number;
};

/** Sites downwind of the vent, ordered by arrival. */
export const SITES: readonly PlumeSite[] = [
  { name: "Cilegon Site", lon: 105.99, lat: -6.02, etaHours: 3, pm25: 182, tone: theme.crit, labelOffset: -2.6 },
  { name: "Serang Site", lon: 106.15, lat: -6.12, etaHours: 5, pm25: 134, tone: theme.high, labelOffset: 4.2 },
  { name: "Tangerang Site", lon: 106.63, lat: -6.18, etaHours: 9, pm25: 86, tone: theme.warn, labelOffset: 8.2 },
  { name: "North Jakarta Site", lon: 106.85, lat: -6.13, etaHours: 12, pm25: 52, tone: theme.ok, labelOffset: -5.6 },
];

/** Zoomed onto the Sunda Strait / Banten / Jakarta corridor. */
const VIEW = { x: 225, y: 255, w: 46, h: 26 };

const vent = project(VENT.lon, VENT.lat);

/** Seconds the plume takes to travel the full corridor, unless overridden. */
export const DEFAULT_TRAVEL_SECONDS = 7;
export const PLUME_START_SECONDS = 0.6;
export const MAX_ETA = 12;

/** Hours elapsed at a given frame — shared by the map and the arrival table. */
export const plumeHours = (
  frame: number,
  fps: number,
  travelSeconds: number,
): number =>
  interpolate(
    frame,
    [PLUME_START_SECONDS * fps, travelSeconds * fps],
    [0, MAX_ETA],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

const Puff: React.FC<{
  readonly index: number;
  readonly total: number;
  readonly progress: number;
}> = ({ index, total, progress }) => {
  const last = project(SITES[SITES.length - 1].lon, SITES[SITES.length - 1].lat);

  // Each puff is released a little later, so the plume grows as a column.
  const release = (index / total) * 0.55;
  const local = Math.max(0, (progress - release) / (1 - release));
  if (local <= 0) {
    return null;
  }

  const reach = interpolate(local, [0, 1], [0, 1], {
    easing: Easing.bezier(0.3, 0.6, 0.4, 1),
  });

  // Slight lateral spread so the plume fans out instead of staying a line.
  const spread = ((index % 3) - 1) * 0.8 * reach;

  return (
    <circle
      cx={vent.x + (last.x - vent.x) * reach}
      cy={vent.y + (last.y - vent.y) * reach + spread}
      r={0.9 + reach * 2.4}
      fill={theme.ink2}
      opacity={0.17 * (1 - reach * 0.65) * Math.min(1, local * 6)}
    />
  );
};

const SiteMarker: React.FC<{
  readonly site: PlumeSite;
  readonly hoursElapsed: number;
}> = ({ site, hoursElapsed }) => {
  const pos = project(site.lon, site.lat);
  const hit = hoursElapsed >= site.etaHours;
  const since = hoursElapsed - site.etaHours;

  const impact = interpolate(since, [0, 1.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Name and reading stack together, staggered per site to avoid overlap.
  const above = site.labelOffset < 0;
  const nameY = pos.y + site.labelOffset;
  const readingY = nameY + (above ? -2.3 : 2.3);

  return (
    <g>
      {/* Impact halo once the plume arrives. */}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={1.4 + impact * 3.6}
        fill={site.tone}
        opacity={impact * 0.2}
      />
      <circle
        cx={pos.x}
        cy={pos.y}
        r={0.85}
        fill={hit ? site.tone : theme.surface}
        stroke={hit ? theme.surface : theme.ink3}
        strokeWidth={0.35}
      />
      <text
        x={pos.x}
        y={nameY}
        textAnchor="middle"
        style={{
          fontFamily: theme.font,
          fontSize: 1.9,
          fontWeight: 600,
          fill: hit ? site.tone : theme.ink2,
        }}
      >
        {site.name.replace(" Site", "")}
      </text>
      <text
        x={pos.x}
        y={readingY}
        textAnchor="middle"
        style={{
          fontFamily: theme.mono,
          fontSize: 1.6,
          fontWeight: 600,
          fill: theme.ink3,
          opacity: impact,
        }}
      >
        {`+${site.etaHours}h · ${site.pm25} µg/m³`}
      </text>
    </g>
  );
};

export const PlumeMap: React.FC<{
  readonly style?: React.CSSProperties;
  readonly travelSeconds?: number;
}> = ({ style, travelSeconds = DEFAULT_TRAVEL_SECONDS }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const hoursElapsed = plumeHours(frame, fps, travelSeconds);
  const progress = hoursElapsed / MAX_ETA;

  return (
    <svg
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
      style={{ width: "100%", display: "block", ...style }}
    >
      <rect
        x={VIEW.x}
        y={VIEW.y}
        width={VIEW.w}
        height={VIEW.h}
        fill={theme.surfaceSunk}
      />

      <g>
        {REGIONS.map((r) => (
          <path
            key={r.name}
            d={r.d}
            fill={theme.lavender}
            stroke={theme.lineStrong}
            strokeWidth={0.12}
          />
        ))}
      </g>

      {/* Downwind corridor the forecast follows. */}
      <line
        x1={vent.x}
        y1={vent.y}
        x2={project(SITES[SITES.length - 1].lon, SITES[SITES.length - 1].lat).x}
        y2={project(SITES[SITES.length - 1].lon, SITES[SITES.length - 1].lat).y}
        stroke={theme.ink3}
        strokeWidth={0.15}
        strokeDasharray="1 1"
        opacity={0.5}
      />

      <g>
        {new Array(16).fill(true).map((_, i) => (
          <Puff key={i} index={i} total={16} progress={progress} />
        ))}
      </g>

      {SITES.map((site) => (
        <SiteMarker key={site.name} site={site} hoursElapsed={hoursElapsed} />
      ))}

      {/* The vent itself. */}
      <g>
        <circle cx={vent.x} cy={vent.y} r={2.2} fill={theme.crit} opacity={0.14} />
        <circle
          cx={vent.x}
          cy={vent.y}
          r={1}
          fill={theme.crit}
          stroke={theme.surface}
          strokeWidth={0.35}
        />
        <text
          x={vent.x}
          y={vent.y + 4}
          textAnchor="middle"
          style={{
            fontFamily: theme.font,
            fontSize: 2,
            fontWeight: 700,
            fill: theme.crit,
          }}
        >
          Anak Krakatau
        </text>
      </g>
    </svg>
  );
};
