import Link from "next/link";
import { Panel } from "@/components/atoms/Panel/Panel";
import { StatusDot } from "@/components/atoms/StatusDot/StatusDot";
import { Tag } from "@/components/atoms/Tag/Tag";
import { DataTable, type Column } from "@/components/molecules/DataTable/DataTable";
import { StatBlock } from "@/components/molecules/StatBlock/StatBlock";
import { PageHeader } from "@/components/organisms/PageHeader/PageHeader";
import { ServiceNotice } from "@/components/organisms/ServiceNotice/ServiceNotice";
import { Grid } from "@/components/templates/PageSection/PageSection";
import { isReporting } from "@/lib/adapt";
import { ago, num } from "@/lib/format";
import { ispuColor, pollutantLabel } from "@/lib/ispu";
import { getJakartaAir } from "@/lib/jakarta";
import type { JakartaStation } from "@/types/jakarta";
import styles from "./page.module.css";

export const revalidate = 600;

export const metadata = {
  title: "Monitoring network — Seviron",
  description:
    "Every air quality station in the DKI Jakarta monitoring network, with its latest reading and reporting status.",
};

const columns: Column<JakartaStation>[] = [
  {
    key: "station",
    header: "Station",
    render: (s) => (
      <div className={styles.device}>
        <StatusDot tone={isReporting(s) ? "good" : "idle"} />
        <div>
          <Link href={`/decisions?station=${s.id}`} className={styles.name}>
            {s.name}
          </Link>
          <span className={styles.id}>{s.code || s.id.slice(0, 8)}</span>
        </div>
      </div>
    ),
  },
  { key: "city", header: "Area", render: (s) => s.city },
  { key: "district", header: "Kecamatan", render: (s) => s.district || "—" },
  {
    key: "dominant",
    header: "Dominant",
    render: (s) => <Tag>{pollutantLabel(s.dominant)}</Tag>,
  },
  {
    key: "concentration",
    header: "Concentration",
    align: "right",
    render: (s) => (
      <span className="u-num">
        {s.dominantValue === null ? "—" : `${num(s.dominantValue)} µg/m³`}
      </span>
    ),
  },
  {
    key: "ispu",
    header: "ISPU",
    align: "right",
    render: (s) => (
      <span className="u-num" style={{ color: ispuColor[s.severity], fontWeight: 700 }}>
        {s.ispu}
      </span>
    ),
  },
  {
    key: "seen",
    header: "Last sample",
    align: "right",
    render: (s) => (
      <span className={isReporting(s) ? styles.seen : styles.stale}>
        {s.measuredAt ? ago(s.measuredAt) : "no data"}
      </span>
    ),
  },
];

export default async function SensorsPage() {
  let snapshot;
  try {
    snapshot = await getJakartaAir();
  } catch (err) {
    return <ServiceNotice error={err} />;
  }

  const { stations, summary } = snapshot;
  const online = stations.filter(isReporting).length;
  const areas = new Set(stations.map((s) => s.city)).size;
  const measurands = new Set(stations.map((s) => s.dominant)).size;

  return (
    <>
      <PageHeader
        eyebrow="Monitor"
        title="Monitoring network"
        description="Every station in the DKI Jakarta public air quality network (SPKU), normalized into one inventory. Readings are published by Dinas Lingkungan Hidup and refreshed every 30 minutes."
        meta={`${online}/${stations.length} reporting`}
      />

      <Grid columns={4}>
        <Panel padded={false}>
          <StatBlock
            label="Stations"
            value={String(stations.length)}
            hint={`${online} reporting now`}
          />
        </Panel>
        <Panel padded={false}>
          <StatBlock label="Areas covered" value={String(areas)} hint="Kota and kabupaten" />
        </Panel>
        <Panel padded={false}>
          <StatBlock
            label="Dominant pollutants"
            value={String(measurands)}
            hint="Driving the index"
          />
        </Panel>
        <Panel padded={false}>
          <StatBlock
            label="Network mean"
            value={String(summary.mean)}
            unit="ISPU"
            hint="Mainland stations"
            tone={ispuColor[summary.meanSeverity]}
          />
        </Panel>
      </Grid>

      <Panel
        title="Area averages"
        caption="Mean ISPU per administrative area, worst first."
      >
        <ul className={styles.areas}>
          {summary.cities.map((c) => (
            <li key={c.city} className={styles.area}>
              <span className={styles.areaName}>{c.city}</span>
              <span className={styles.areaTrack}>
                <span
                  className={styles.areaFill}
                  style={{
                    // Scaled against 200, the top of the "Tidak Sehat" band.
                    width: `${Math.min(100, (c.mean / 200) * 100)}%`,
                    background: ispuColor[c.mean <= 50 ? "good" : c.mean <= 100 ? "moderate" : "high"],
                  }}
                />
              </span>
              <span className={`${styles.areaValue} u-num`}>{c.mean}</span>
              <span className={styles.areaCount}>{c.count} stations</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="Connected stations"
        caption="Source: udara.jakarta.go.id · DLH DKI Jakarta"
        padded={false}
      >
        <div className={styles.table}>
          <DataTable columns={columns} rows={stations} rowKey={(s) => s.id} />
        </div>
      </Panel>
    </>
  );
}
