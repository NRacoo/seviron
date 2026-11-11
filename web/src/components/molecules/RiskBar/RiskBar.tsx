import { severityColor } from "@/lib/format";
import type { Severity } from "@/types/decision";
import styles from "./RiskBar.module.css";

const bands: { to: number; label: string }[] = [
  { to: 25, label: "Low" },
  { to: 50, label: "Moderate" },
  { to: 75, label: "Elevated" },
  { to: 100, label: "High" },
];

export function RiskBar({
  score,
  label,
  level,
}: {
  score: number;
  label: string;
  level: Severity;
}) {
  const color = severityColor[level];
  const clamped = Math.min(Math.max(score, 0), 100);

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <span className={styles.caption}>Operational risk index</span>
        <span className={`${styles.score} u-num`} style={{ color }}>
          {score}
          <span className={styles.outOf}>/100</span>
        </span>
      </div>

      <div className={styles.track} role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
        <span className={styles.fill} style={{ width: `${clamped}%`, background: color }} />
        {bands.slice(0, -1).map((b) => (
          <span key={b.to} className={styles.divider} style={{ left: `${b.to}%` }} />
        ))}
      </div>

      <div className={styles.scale}>
        {bands.map((b) => (
          <span key={b.label}>{b.label}</span>
        ))}
      </div>

      <p className={styles.verdict} style={{ borderLeftColor: color }}>
        {label}
      </p>
    </div>
  );
}
