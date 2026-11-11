import styles from "./StatusDot.module.css";

export function StatusDot({
  tone = "good",
  pulse = false,
}: {
  tone?: "good" | "moderate" | "high" | "danger" | "idle";
  pulse?: boolean;
}) {
  return <span className={`${styles.dot} ${styles[tone]} ${pulse ? styles.pulse : ""}`} />;
}
