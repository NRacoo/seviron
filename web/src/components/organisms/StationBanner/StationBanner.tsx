import { Tag } from "@/components/atoms/Tag/Tag";
import { ispuColor } from "@/lib/ispu";
import { wibDateTime } from "@/lib/format";
import type { StationDetail } from "@/types/jakarta";
import styles from "./StationBanner.module.css";

/**
 * Identifies which station the page is reporting on, and makes the provenance
 * of the numbers explicit. Shown on every station-scoped page so a reader can
 * never mistake one station's readings for another's.
 */
export function StationBanner({
  detail,
  fellBack,
}: {
  detail: StationDetail;
  fellBack?: boolean;
}) {
  const color = ispuColor[detail.severity];

  return (
    <div className={styles.banner}>
      <span className={styles.rail} style={{ background: color }} />

      <div className={styles.main}>
        <div className={styles.top}>
          <h2 className={styles.name}>{detail.name}</h2>
          <Tag tone={detail.severity}>{detail.status}</Tag>
        </div>

        <p className={styles.meta}>
          {[detail.district, detail.city].filter(Boolean).join(" · ")}
          {detail.operator ? ` · operated by ${detail.operator}` : ""}
        </p>

        {fellBack ? (
          <p className={styles.note}>
            The requested station is no longer in the network. Showing the
            worst-performing station instead.
          </p>
        ) : null}
      </div>

      <div className={styles.reading}>
        <span className={`${styles.value} u-num`} style={{ color }}>
          {detail.ispu}
        </span>
        <span className={styles.unit}>ISPU</span>
        <span className={styles.driver}>{detail.dominantLabel}</span>
        {detail.updatedAt ? (
          <span className={styles.stamp}>{wibDateTime(detail.updatedAt)} WIB</span>
        ) : null}
      </div>
    </div>
  );
}
