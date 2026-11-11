import { Icon } from "@/components/atoms/Icon/Icon";
import { Spark } from "@/components/atoms/Chart/Spark";
import { Tag } from "@/components/atoms/Tag/Tag";
import { hour, num, severityColor, severityLabel, signed } from "@/lib/format";
import type { ParameterCard } from "@/types/decision";
import styles from "./MetricTile.module.css";

export function MetricTile({ card }: { card: ParameterCard }) {
  const color = severityColor[card.severity];
  const rising = card.delta >= 0;

  return (
    <article className={styles.tile}>
      <span className={styles.rail} style={{ background: color }} />

      <header className={styles.head}>
        <span className={styles.label}>{card.label}</span>
        <span className={styles.unit}>{card.unit}</span>
      </header>

      <div className={styles.readings}>
        <div className={styles.cell}>
          <span className={styles.cellLabel}>now</span>
          <span className={`${styles.now} u-num`}>{num(card.now)}</span>
        </div>
        <div className={styles.cell}>
          <span className={styles.cellLabel}>
            {card.projected === false ? "peak" : "fcst"} {hour(card.peak_hour)}
          </span>
          <span className={`${styles.peak} u-num`} style={{ color }}>
            {num(card.forecast)}
          </span>
        </div>
      </div>

      <div className={styles.foot}>
        <span className={styles.delta} style={{ color: rising ? color : "var(--ok)" }}>
          <Icon name={rising ? "arrow-up" : "arrow-down"} size={12} strokeWidth={1.8} />
          <span className="u-num">{signed(card.delta)}</span>
        </span>
        <Spark points={card.trend} color={color} width={70} height={22} />
      </div>

      <div className={styles.status}>
        <Tag tone={card.severity}>{severityLabel[card.severity]}</Tag>
        <span className={styles.limit}>
          limit <span className="u-num">{num(card.limit)}</span>
        </span>
      </div>
    </article>
  );
}
