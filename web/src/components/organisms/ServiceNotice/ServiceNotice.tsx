import { Icon } from "@/components/atoms/Icon/Icon";
import styles from "./ServiceNotice.module.css";

export function ServiceNotice({ error }: { error: unknown }) {
  return (
    <div className={styles.notice}>
      <span className={styles.icon}>
        <Icon name="alert" size={18} />
      </span>
      <div>
        <h2 className={styles.title}>Air quality data unavailable</h2>
        <p className={styles.body}>
          The dashboard could not reach the DKI Jakarta monitoring portal at{" "}
          <code className={styles.code}>udara.jakarta.go.id</code>. Readings
          will reappear automatically once the source responds.
        </p>
        <p className={styles.detail}>{String(error)}</p>
      </div>
    </div>
  );
}
