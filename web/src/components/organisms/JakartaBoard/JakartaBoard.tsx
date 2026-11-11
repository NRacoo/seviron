"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/atoms/Icon/Icon";
import { JakartaMap } from "@/components/organisms/JakartaMap/JakartaMap";
import {
  ispuAdvice,
  ispuBandLabel,
  ispuBandRange,
  ispuBands,
  ispuColor,
  pollutantLabel,
} from "@/lib/ispu";
import type { JakartaSnapshot } from "@/types/jakarta";
import styles from "./JakartaBoard.module.css";

function Reading({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.reading}>
      <dt>{label}</dt>
      <dd className="u-num">{value}</dd>
    </div>
  );
}

export function JakartaBoard({ data }: { data: JakartaSnapshot }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const mainland = useMemo(
    () => data.stations.filter((s) => !s.offshore),
    [data.stations],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mainland;
    return mainland.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q),
    );
  }, [mainland, query]);

  const active = useMemo(
    () => data.stations.find((s) => s.id === activeId) ?? null,
    [data.stations, activeId],
  );

  const { summary, meteo } = data;
  const today = data.forecast[0];

  return (
    <div className={styles.shell}>
      <div className={styles.stage}>
        <JakartaMap
          stations={mainland}
          activeId={activeId}
          onSelect={setActiveId}
        />

        {/* Headline reading, floating over the map. */}
        <div className={styles.headline}>
          <span className={styles.headlineLabel}>Jakarta average ISPU</span>
          <div className={styles.headlineRow}>
            <span
              className={`${styles.headlineValue} u-num`}
              style={{ color: ispuColor[summary.meanSeverity] }}
            >
              {summary.mean}
            </span>
            <span className={styles.headlineBand}>
              {ispuBandLabel[summary.meanSeverity]}
            </span>
          </div>
          <p className={styles.headlineNote}>
            {summary.unhealthy > 0
              ? `${summary.unhealthy} of ${summary.total} stations above the healthy limit.`
              : `All ${summary.total} stations within the healthy limit.`}
          </p>
        </div>

        {/* Band legend. */}
        <div className={styles.legend}>
          <span className={styles.legendTitle}>ISPU band</span>
          <ul>
            {ispuBands.map((band) => (
              <li key={band}>
                <span
                  className={styles.swatch}
                  style={{ background: ispuColor[band] }}
                />
                <span className={styles.legendLabel}>
                  {ispuBandLabel[band]}
                </span>
                <span className={`${styles.legendRange} u-num`}>
                  {ispuBandRange[band]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Selected station detail. */}
        {active ? (
          <aside className={styles.card}>
            <button
              type="button"
              className={styles.cardClose}
              onClick={() => setActiveId(null)}
              aria-label="Close station detail"
            >
              ×
            </button>

            <span
              className={styles.cardBand}
              style={{
                background: ispuColor[active.severity],
              }}
            >
              {active.status}
            </span>

            <h3 className={styles.cardTitle}>{active.name}</h3>
            <p className={styles.cardMeta}>
              {active.district ? `${active.district} · ` : ""}
              {active.city}
            </p>

            <div className={styles.cardValue}>
              <span
                className="u-num"
                style={{ color: ispuColor[active.severity] }}
              >
                {active.ispu}
              </span>
              <span className={styles.cardUnit}>ISPU</span>
            </div>

            <dl className={styles.readings}>
              <Reading
                label={pollutantLabel(active.dominant)}
                value={
                  active.dominantValue === null
                    ? "—"
                    : `${active.dominantValue.toFixed(1)} µg/m³`
                }
              />
              <Reading
                label="Suhu"
                value={
                  active.temperature === null
                    ? "—"
                    : `${active.temperature.toFixed(1)} °C`
                }
              />
              <Reading
                label="Lembap"
                value={
                  active.humidity === null
                    ? "—"
                    : `${active.humidity.toFixed(0)} %`
                }
              />
            </dl>

            <p className={styles.cardAdvice}>{ispuAdvice(active.severity)}</p>

            <Link href={`/decisions?station=${active.id}`} className={styles.cardLink}>
              Open site decision
              <Icon name="chevron" size={13} />
            </Link>
          </aside>
        ) : null}
      </div>

      {/* Right-hand briefing rail. */}
      <aside className={styles.rail}>
        <header className={styles.railHead}>
          <div>
            <span className="u-eyebrow">Live · DKI Jakarta</span>
            <h2 className={styles.railTitle}>Air quality now</h2>
          </div>
          <p className={styles.railStamp}>
            {data.updatedAt
              ? `Updated ${data.updatedAt.slice(11, 16)} WIB`
              : "Live"}
          </p>
        </header>

        <div className={styles.tiles}>
          <div className={styles.tile}>
            <span className={`${styles.tileValue} u-num`}>
              {summary.unhealthy}
            </span>
            <span className={styles.tileLabel}>
              Stations above
              <br />
              healthy limit
            </span>
          </div>
          <div className={styles.tile}>
            <span className={`${styles.tileValue} u-num`}>
              {summary.worst?.ispu ?? "—"}
            </span>
            <span className={styles.tileLabel}>
              Worst reading
              <br />
              {summary.worst?.city ?? ""}
            </span>
          </div>
        </div>

        {today ? (
          <section className={styles.block}>
            <h3 className={styles.blockTitle}>Forecast</h3>
            <ul className={styles.forecast}>
              {data.forecast.map((d) => (
                <li key={d.dateIso}>
                  <span className={styles.fcLabel}>{d.label}</span>
                  <span className={styles.fcDate}>{d.date}</span>
                  <span
                    className={`${styles.fcValue} u-num`}
                    style={{ color: ispuColor[d.severity] }}
                  >
                    {d.ispu}
                  </span>
                </li>
              ))}
            </ul>
            <p className={styles.blockNote}>
              SILAM dispersion model via udara.jakarta.go.id.
            </p>
          </section>
        ) : null}

        {meteo ? (
          <section className={styles.block}>
            <h3 className={styles.blockTitle}>Conditions</h3>
            <dl className={styles.meteo}>
              {meteo.humidity !== null ? (
                <Reading
                  label="Kelembapan"
                  value={`${meteo.humidity.toFixed(0)} %`}
                />
              ) : null}
              {meteo.temperature !== null ? (
                <Reading
                  label="Suhu"
                  value={`${meteo.temperature.toFixed(1)} °C`}
                />
              ) : null}
              {meteo.rainfall !== null ? (
                <Reading
                  label="Curah hujan"
                  value={`${meteo.rainfall.toFixed(1)} mm`}
                />
              ) : null}
              {meteo.windSpeed !== null ? (
                <Reading
                  label="Angin"
                  value={`${meteo.windSpeed.toFixed(1)} m/s`}
                />
              ) : null}
            </dl>
          </section>
        ) : null}

        <section className={`${styles.block} ${styles.blockGrow}`}>
          <div className={styles.listHead}>
            <h3 className={styles.blockTitle}>Stations</h3>
            <span className={`${styles.listCount} u-num`}>
              {filtered.length}
            </span>
          </div>

          <label className={styles.search}>
            <Icon name="map" size={13} />
            <input
              type="search"
              value={query}
              placeholder="Search station or area"
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>

          <ul className={styles.stations}>
            {filtered.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={`${styles.station} ${
                    s.id === activeId ? styles.stationActive : ""
                  }`}
                  onClick={() => setActiveId(s.id)}
                >
                  <span
                    className={styles.stationBar}
                    style={{ background: ispuColor[s.severity] }}
                  />
                  <span className={styles.stationBody}>
                    <span className={styles.stationName}>{s.name}</span>
                    <span className={styles.stationMeta}>
                      {s.city} · {pollutantLabel(s.dominant)}
                    </span>
                  </span>
                  <span
                    className={`${styles.stationValue} u-num`}
                    style={{ color: ispuColor[s.severity] }}
                  >
                    {s.ispu}
                  </span>
                </button>
              </li>
            ))}
            {filtered.length === 0 ? (
              <li className={styles.empty}>No station matches “{query}”.</li>
            ) : null}
          </ul>
        </section>
      </aside>
    </div>
  );
}
