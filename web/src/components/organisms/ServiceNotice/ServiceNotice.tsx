import { Icon } from "@/components/atoms/Icon/Icon";
import styles from "./ServiceNotice.module.css";

export function ServiceNotice({ error }: { error: unknown }) {
  return (
    <div className={styles.notice}>
      <span className={styles.icon}>
        <Icon name="alert" size={18} />
      </span>
      <div>
        <h2 className={styles.title}>Decision service unavailable</h2>
        <p className={styles.body}>
          The dashboard could not reach the Go decision service. Start it with{" "}
          <code className={styles.code}>cd service &amp;&amp; go run ./cmd/server</code>.
        </p>
        <p className={styles.detail}>{String(error)}</p>
      </div>
    </div>
  );
}
