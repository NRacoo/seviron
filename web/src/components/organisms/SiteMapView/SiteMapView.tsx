"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/atoms/Icon/Icon";
import { Tag } from "@/components/atoms/Tag/Tag";
import { MAP_HEIGHT, MAP_WIDTH, REGIONS, project } from "@/lib/geo/indonesia";
import { hour, num, severityColor } from "@/lib/format";
import type { Severity, SiteMarker } from "@/types/decision";
import styles from "./SiteMapView.module.css";

const legend: { level: Severity; label: string }[] = [
  { level: "good", label: "Within limit" },
  { level: "moderate", label: "Watch" },
  { level: "high", label: "Above limit" },
  { level: "danger", label: "Critical" },
];

function radius(score: number) {
  return 6 + (Math.min(Math.max(score, 0), 100) / 100) * 7;
}

export function SiteMapView({
  sites,
  activeSite,
  onSelect,
}: {
  sites: SiteMarker[];
  activeSite?: string;
  onSelect?: (name: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const placed = useMemo(
    () => sites.map((s) => ({ site: s, pos: project(s.lon, s.lat) })),
    [sites],
  );

  const focus = hovered ?? activeSite ?? null;
  const detail = placed.find((p) => p.site.name === focus);

  return (
    <div className={styles.wrap}>
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className={styles.map}
        role="img"
        aria-label="Forecast risk by site across Indonesia"
      >
        <defs>
          <filter id="marker-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.4" floodOpacity="0.22" />
          </filter>
        </defs>

        <g className={styles.landmass}>
          {REGIONS.map((r) => (
            <path key={r.name} d={r.d} className={styles.region}>
              <title>{r.name}</title>
            </path>
          ))}
        </g>

        {placed.map(({ site, pos }) => {
          const color = severityColor[site.risk_level];
          const isFocus = site.name === focus;
          const r = radius(site.risk_score);

          return (
            <g
              key={site.name}
              className={styles.marker}
              transform={`translate(${pos.x} ${pos.y})`}
              onMouseEnter={() => setHovered(site.name)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect?.(site.name)}
              role="button"
              tabIndex={0}
              aria-label={`${site.name}, risk ${site.risk_score}`}
              onFocus={() => setHovered(site.name)}
              onBlur={() => setHovered(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect?.(site.name);
                }
              }}
            >
              <circle r={r * 2.1} fill={color} opacity={isFocus ? 0.16 : 0.08} />
              <circle
                r={r}
                fill={color}
                stroke="#fff"
                strokeWidth={isFocus ? 2.4 : 1.6}
                filter="url(#marker-shadow)"
              />
              <text y={-r - 7} className={`${styles.pinLabel} ${isFocus ? styles.pinFocus : ""}`}>
                {site.name}
              </text>
            </g>
          );
        })}
      </svg>

      <div className={styles.strip}>
        <div className={styles.overlay}>
          <ul className={styles.legend}>
            {legend.map((l) => (
              <li key={l.level}>
                <span className={styles.swatch} style={{ background: severityColor[l.level] }} />
                {l.label}
              </li>
            ))}
          </ul>
          <span className={styles.scaleNote}>Marker size scales with risk index</span>
        </div>

        {detail ? (
        <aside className={styles.card}>
          <header className={styles.cardHead}>
            <div className={styles.cardIdent}>
              <h4 className={styles.cardTitle}>{detail.site.name}</h4>
              <p className={styles.cardRegion}>
                {detail.site.region} · {detail.site.category}
              </p>
            </div>
            <Tag tone={detail.site.risk_level}>{detail.site.risk_score}</Tag>
          </header>

          <p className={styles.cardHeadline}>{detail.site.headline}</p>

          <dl className={styles.cardStats}>
            <div>
              <dt>Driver</dt>
              <dd>
                {detail.site.driver}{" "}
                <span className="u-num">{num(detail.site.driver_value)}</span>{" "}
                <span className={styles.unit}>{detail.site.driver_unit}</span>
              </dd>
            </div>
            <div>
              <dt>Peak</dt>
              <dd className="u-num">{hour(detail.site.peak_hour)}</dd>
            </div>
            <div>
              <dt>At risk</dt>
              <dd className="u-num">
                {detail.site.at_risk_count}/{detail.site.total_params}
              </dd>
            </div>
          </dl>

          {onSelect ? (
            <button
              type="button"
              className={styles.cardAction}
              onClick={() => onSelect(detail.site.name)}
            >
              Open site forecast
              <Icon name="chevron" size={13} />
            </button>
          ) : null}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
