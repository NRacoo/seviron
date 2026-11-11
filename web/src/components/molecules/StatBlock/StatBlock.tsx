import styles from "./StatBlock.module.css";

export function StatBlock({
  label,
  value,
  unit,
  hint,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  tone?: string;
}) {
  return (
    <div className={styles.block}>
      <span className={styles.label}>{label}</span>
      <span className={`${styles.value} u-num`} style={tone ? { color: tone } : undefined}>
        {value}
        {unit ? <span className={styles.unit}>{unit}</span> : null}
      </span>
      {hint ? <span className={styles.hint}>{hint}</span> : null}
    </div>
  );
}
