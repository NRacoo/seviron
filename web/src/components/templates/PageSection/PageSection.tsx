import styles from "./PageSection.module.css";

export function Grid({
  columns = 2,
  children,
}: {
  columns?: 2 | 3 | 4 | 6;
  children: React.ReactNode;
}) {
  return <div className={`${styles.grid} ${styles[`c${columns}`]}`}>{children}</div>;
}

export function Split({
  ratio = "wide",
  children,
}: {
  ratio?: "wide" | "even";
  children: React.ReactNode;
}) {
  return <div className={`${styles.split} ${styles[ratio]}`}>{children}</div>;
}

export function Stack({ children }: { children: React.ReactNode }) {
  return <div className={styles.stack}>{children}</div>;
}
