import { Panel } from "@/components/atoms/Panel/Panel";
import { StatusDot } from "@/components/atoms/StatusDot/StatusDot";
import { Tag } from "@/components/atoms/Tag/Tag";
import { DataTable, type Column } from "@/components/molecules/DataTable/DataTable";
import { StatBlock } from "@/components/molecules/StatBlock/StatBlock";
import { PageHeader } from "@/components/organisms/PageHeader/PageHeader";
import { ServiceNotice } from "@/components/organisms/ServiceNotice/ServiceNotice";
import { Grid } from "@/components/templates/PageSection/PageSection";
import { getSensors } from "@/lib/api";
import { ago, num } from "@/lib/format";
import type { Sensor } from "@/types/decision";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

const paramLabel: Record<string, string> = {
  pm25: "PM2.5",
  pm10: "PM10",
  no2: "NO₂",
  o3: "O₃",
  co2: "CO₂",
  heat_index: "Heat index",
};

const columns: Column<Sensor>[] = [
  {
    key: "device",
    header: "Device",
    render: (s) => (
      <div className={styles.device}>
        <StatusDot tone={s.online ? "good" : "idle"} />
        <div>
          <span className={styles.name}>{s.name}</span>
          <span className={styles.id}>{s.device_id}</span>
        </div>
      </div>
    ),
  },
  { key: "vendor", header: "Vendor model", render: (s) => s.vendor },
  { key: "placement", header: "Placement", render: (s) => s.placement },
  {
    key: "params",
    header: "Parameters",
    render: (s) => (
      <span className={styles.params}>
        {s.parameters.map((p) => (
          <Tag key={p}>{paramLabel[p] ?? p}</Tag>
        ))}
      </span>
    ),
  },
  {
    key: "uptime",
    header: "Uptime 30d",
    align: "right",
    render: (s) => <span className="u-num">{num(s.uptime)}%</span>,
  },
  {
    key: "seen",
    header: "Last sample",
    align: "right",
    render: (s) => (
      <span className={s.online ? styles.seen : styles.stale}>{ago(s.last_seen)}</span>
    ),
  },
];

export default async function SensorsPage({
  searchParams,
}: {
  searchParams: Promise<{ site?: string }>;
}) {
  const { site } = await searchParams;
  let fleet;
  try {
    fleet = await getSensors(site);
  } catch (err) {
    return <ServiceNotice error={err} />;
  }

  const vendors = new Set(fleet.sensors.map((s) => s.vendor)).size;
  const coverage = new Set(fleet.sensors.flatMap((s) => s.parameters)).size;
  const avgUptime =
    fleet.sensors.reduce((a, s) => a + s.uptime, 0) / Math.max(1, fleet.sensors.length);

  return (
    <>
      <PageHeader
        eyebrow="Monitor"
        title="Sensor network"
        description="Every connected device from the upstream data service, normalized into a single vendor-agnostic inventory. Mixed hardware, one schema."
        meta={`${fleet.online}/${fleet.total} reporting`}
      />

      <Grid columns={4}>
        <Panel padded={false}>
          <StatBlock label="Devices" value={String(fleet.total)} hint={`${fleet.online} online`} />
        </Panel>
        <Panel padded={false}>
          <StatBlock label="Vendor models" value={String(vendors)} hint="Normalized at ingest" />
        </Panel>
        <Panel padded={false}>
          <StatBlock label="Parameters" value={String(coverage)} hint="Distinct measurands" />
        </Panel>
        <Panel padded={false}>
          <StatBlock label="Mean uptime" value={num(avgUptime)} unit="%" hint="Rolling 30 days" />
        </Panel>
      </Grid>

      <Panel
        title="Connected devices"
        caption="Source: api-data-services · /api/v1/devices/stasiun/:stasiun"
        padded={false}
      >
        <div className={styles.table}>
          <DataTable columns={columns} rows={fleet.sensors} rowKey={(s) => s.device_id} />
        </div>
      </Panel>
    </>
  );
}
