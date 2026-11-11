"use client";

import { useState } from "react";
import { LineChart } from "@/components/atoms/Chart/LineChart";
import { Panel } from "@/components/atoms/Panel/Panel";
import { Tag } from "@/components/atoms/Tag/Tag";
import { hour, num, severityColor, severityLabel } from "@/lib/format";
import type { ParameterCard } from "@/types/decision";
import styles from "./ForecastExplorer.module.css";

export function ForecastExplorer({ cards }: { cards: ParameterCard[] }) {
  const [active, setActive] = useState(cards[0]?.parameter ?? "");
  const card = cards.find((c) => c.parameter === active) ?? cards[0];
  if (!card) return null;

  const color = severityColor[card.severity];

  // Pollutant series carry no projection — the portal forecasts the index
  // only — so the chart and labels describe observations instead.
  const observed = card.projected === false;

  return (
    <Panel
      title={observed ? "Observed 48 hours" : "Index projection"}
      caption={
        observed
          ? "Half-hourly readings from the station, against its regulatory or advisory limit."
          : "Three-day SILAM dispersion forecast, compared against the observed series."
      }
      aside={<Tag tone={card.severity}>{severityLabel[card.severity]}</Tag>}
      padded={false}
    >
      <div className={styles.tabs} role="tablist">
        {cards.map((c) => (
          <button
            key={c.parameter}
            role="tab"
            aria-selected={c.parameter === active}
            className={`${styles.tab} ${c.parameter === active ? styles.tabActive : ""}`}
            onClick={() => setActive(c.parameter)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className={styles.body}>
        <div className={styles.summary}>
          <div className={styles.sum}>
            <span className={styles.sumLabel}>Current</span>
            <span className={`${styles.sumValue} u-num`}>{num(card.now)}</span>
            <span className={styles.sumUnit}>{card.unit}</span>
          </div>
          <div className={styles.sum}>
            <span className={styles.sumLabel}>
              {observed ? "Observed peak" : "Forecast peak"}
            </span>
            <span className={`${styles.sumValue} u-num`} style={{ color }}>
              {num(card.forecast)}
            </span>
            <span className={styles.sumUnit}>at {hour(card.peak_hour)} WIB</span>
          </div>
          <div className={styles.sum}>
            <span className={styles.sumLabel}>Limit</span>
            <span className={`${styles.sumValue} u-num`}>{num(card.limit)}</span>
            <span className={styles.sumUnit}>{card.unit}</span>
          </div>
          <div className={styles.sum}>
            <span className={styles.sumLabel}>Source</span>
            <span className={styles.sumText}>{card.vendor}</span>
          </div>
        </div>

        <LineChart
          unit={card.unit}
          limit={card.limit}
          height={200}
          series={
            observed
              ? [{ points: card.history, color, fill: true }]
              : [
                  { points: card.history, color: "var(--ink-3)" },
                  { points: card.trend, color, dashed: true, fill: true },
                ]
          }
        />

        <div className={styles.legend}>
          <span className={styles.key}>
            <span
              className={styles.lineSolid}
              style={observed ? { borderTopColor: color } : undefined}
            />
            Observed 48 h
          </span>
          {observed ? null : (
            <span className={styles.key}>
              <span className={styles.lineDashed} style={{ borderTopColor: color }} />
              Forecast H+1 to H+3
            </span>
          )}
          <span className={styles.key}>
            <span className={styles.lineLimit} />
            {card.parameter === "ispu" ? "Healthy limit" : "Limit"}
          </span>
        </div>
      </div>
    </Panel>
  );
}
