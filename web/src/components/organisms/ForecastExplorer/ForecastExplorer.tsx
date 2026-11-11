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

  return (
    <Panel
      title="24-hour projection"
      caption="Holt linear trend with a learned hour-of-day profile, compared against the observed series."
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
            <span className={styles.sumLabel}>Forecast peak</span>
            <span className={`${styles.sumValue} u-num`} style={{ color }}>
              {num(card.forecast)}
            </span>
            <span className={styles.sumUnit}>at {hour(card.peak_hour)}</span>
          </div>
          <div className={styles.sum}>
            <span className={styles.sumLabel}>Shift limit</span>
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
          series={[
            { points: card.history, color: "var(--ink-3)" },
            { points: card.trend, color, dashed: true, fill: true },
          ]}
        />

        <div className={styles.legend}>
          <span className={styles.key}>
            <span className={styles.lineSolid} />
            Observed 24 h
          </span>
          <span className={styles.key}>
            <span className={styles.lineDashed} style={{ borderTopColor: color }} />
            Forecast 24 h
          </span>
          <span className={styles.key}>
            <span className={styles.lineLimit} />
            Shift limit
          </span>
        </div>
      </div>
    </Panel>
  );
}
