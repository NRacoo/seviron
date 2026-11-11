import styles from "./Tag.module.css";

export type TagTone = "good" | "moderate" | "high" | "danger" | "brand" | "neutral";

export function Tag({ tone = "neutral", children }: { tone?: TagTone; children: React.ReactNode }) {
  return <span className={`${styles.tag} ${styles[tone]}`}>{children}</span>;
}
