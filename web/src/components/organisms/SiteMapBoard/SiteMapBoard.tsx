"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Panel } from "@/components/atoms/Panel/Panel";
import { Tag } from "@/components/atoms/Tag/Tag";
import { SiteMapView } from "@/components/organisms/SiteMapView/SiteMapView";
import { hour, num, severityColor, severityLabel } from "@/lib/format";
import type { SiteMarker } from "@/types/decision";
import styles from "./SiteMapBoard.module.css";

export function SiteMapBoard({ sites, horizon }: { sites: SiteMarker[]; horizon: string }) {
  const router = useRouter();
  const [active, setActive] = useState(sites[0]?.name);

  function open(name: string) {
    router.push(`/forecast?site=${encodeURIComponent(name)}`);
  }

  return (
    <div className={styles.board}>
      <Panel
        title="National forecast map"
        caption={`Risk index per site for the next ${horizon}. Select a site to open its forecast.`}
        padded={false}
      >
        <SiteMapView sites={sites} activeSite={active} onSelect={open} />
      </Panel>

      <Panel title="Site ranking" caption="Highest forecast risk first." padded={false}>
        <ul className={styles.list}>
          {sites.map((s) => (
            <li key={s.name}>
              <button
                type="button"
                className={`${styles.row} ${s.name === active ? styles.rowActive : ""}`}
                onMouseEnter={() => setActive(s.name)}
                onFocus={() => setActive(s.name)}
                onClick={() => open(s.name)}
              >
                <span className={styles.bar} style={{ background: severityColor[s.risk_level] }} />
                <span className={styles.rowBody}>
                  <span className={styles.rowTop}>
                    <span className={styles.name}>{s.name}</span>
                    <span className={`${styles.score} u-num`} style={{ color: severityColor[s.risk_level] }}>
                      {s.risk_score}
                    </span>
                  </span>
                  <span className={styles.rowMeta}>
                    <span>{s.region}</span>
                    <span className={styles.dot} />
                    <span className="u-num">
                      {s.driver} {num(s.driver_value)} {s.driver_unit}
                    </span>
                    <span className={styles.dot} />
                    <span className="u-num">peak {hour(s.peak_hour)}</span>
                  </span>
                </span>
                <Tag tone={s.risk_level}>{severityLabel[s.risk_level]}</Tag>
              </button>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
