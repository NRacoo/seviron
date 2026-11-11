import { StatusDot } from "@/components/atoms/StatusDot/StatusDot";
import styles from "./PageHeader.module.css";

export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  meta?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className={styles.header}>
      <div className={styles.text}>
        <span className="u-eyebrow">{eyebrow}</span>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.desc}>{description}</p>
      </div>

      <div className={styles.side}>
        {meta ? (
          <span className={styles.meta}>
            <StatusDot tone="good" pulse />
            {meta}
          </span>
        ) : null}
        {actions}
      </div>
    </header>
  );
}
