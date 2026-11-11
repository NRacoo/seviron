import { Icon } from "@/components/atoms/Icon/Icon";
import { Panel } from "@/components/atoms/Panel/Panel";
import { Tag } from "@/components/atoms/Tag/Tag";
import { DataTable, type Column } from "@/components/molecules/DataTable/DataTable";
import { StatBlock } from "@/components/molecules/StatBlock/StatBlock";
import { PageHeader } from "@/components/organisms/PageHeader/PageHeader";
import { ServiceNotice } from "@/components/organisms/ServiceNotice/ServiceNotice";
import { StationBanner } from "@/components/organisms/StationBanner/StationBanner";
import { Grid, Split, Stack } from "@/components/templates/PageSection/PageSection";
import { complianceRate, metricToESG } from "@/lib/adapt";
import { num, severityColor, severityLabel, wibDate, wibDateTime } from "@/lib/format";
import { ispuColor, pollutantLabel } from "@/lib/ispu";
import { resolveStation } from "@/lib/selection";
import type { ESGMetric } from "@/types/decision";
import type { DailyIspu } from "@/types/jakarta";
import styles from "./page.module.css";

export const revalidate = 600;

export const metadata = {
  title: "ESG and compliance — Seviron",
  description:
    "Thirty-one days of air quality performance against Indonesian ambient standards for a Jakarta monitoring station.",
};

const metricColumns: Column<ESGMetric>[] = [
  {
    key: "label",
    header: "Parameter",
    render: (m) => (
      <span className={styles.metricLabel}>
        <span className={styles.bar} style={{ background: severityColor[m.status] }} />
        {m.label}
      </span>
    ),
  },
  { key: "unit", header: "Unit", render: (m) => <span className={styles.unit}>{m.unit}</span> },
  {
    key: "mean",
    header: "Mean",
    align: "right",
    render: (m) => <span className="u-num">{num(m.mean)}</span>,
  },
  {
    key: "peak",
    header: "Peak",
    align: "right",
    render: (m) => <span className="u-num">{num(m.peak)}</span>,
  },
  {
    key: "limit",
    header: "Limit",
    align: "right",
    render: (m) => (
      <span className={`${styles.muted} u-num`}>{m.limit ? num(m.limit) : "—"}</span>
    ),
  },
  {
    key: "exceeded",
    header: "Hours over",
    align: "right",
    render: (m) => (
      <span
        className="u-num"
        style={{ color: m.exceeded_hours > 0 ? severityColor[m.status] : undefined }}
      >
        {m.limit ? m.exceeded_hours : "—"}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    align: "right",
    render: (m) => <Tag tone={m.status}>{severityLabel[m.status]}</Tag>,
  },
];

const dailyColumns: Column<DailyIspu>[] = [
  { key: "date", header: "Date", render: (d) => wibDate(d.date) },
  {
    key: "dominant",
    header: "Dominant",
    render: (d) => <Tag>{pollutantLabel(d.dominant)}</Tag>,
  },
  {
    key: "conc",
    header: "Concentration",
    align: "right",
    render: (d) => (
      <span className="u-num">
        {d.concentration === null ? "—" : `${num(d.concentration)} µg/m³`}
      </span>
    ),
  },
  {
    key: "ispu",
    header: "Peak ISPU",
    align: "right",
    render: (d) => (
      <span className="u-num" style={{ color: ispuColor[d.severity], fontWeight: 700 }}>
        {d.ispu}
      </span>
    ),
  },
  {
    key: "status",
    header: "Band",
    align: "right",
    render: (d) => <Tag tone={d.severity}>{severityLabel[d.severity]}</Tag>,
  },
];

export default async function ESGPage({
  searchParams,
}: {
  searchParams: Promise<{ station?: string }>;
}) {
  const { station } = await searchParams;

  let selection;
  try {
    selection = await resolveStation(station);
  } catch (err) {
    return <ServiceNotice error={err} />;
  }

  const { detail, fellBack } = selection;

  const metrics = detail.metrics.filter((m) => m.limit !== null).map(metricToESG);
  const rate = complianceRate(detail.daily);
  const exceedanceDays = detail.daily.filter((d) => d.ispu > 100).length;
  const worstDay = detail.daily.reduce(
    (a, d) => (d.ispu > a.ispu ? d : a),
    detail.daily[0],
  );

  const period = detail.daily.length
    ? `${wibDate(detail.daily[0].date)} – ${wibDate(detail.daily.at(-1)!.date)}`
    : "No history available";

  const tone =
    rate >= 95 ? "var(--ok)" : rate >= 85 ? "var(--warn)" : "var(--crit)";

  // Chronological, so the newest reading reads first in the table.
  const dailyDesc = [...detail.daily].reverse();

  return (
    <>
      <PageHeader
        eyebrow="Report"
        title="ESG and compliance"
        description="Air quality performance for this station against Indonesian ambient standards, built from the public monitoring record."
        meta={period}
      />

      <StationBanner detail={detail} fellBack={fellBack} />

      <Grid columns={4}>
        <Panel padded={false}>
          <StatBlock
            label="Compliant days"
            value={String(rate)}
            unit="%"
            hint={`${detail.daily.length}-day window`}
            tone={tone}
          />
        </Panel>
        <Panel padded={false}>
          <StatBlock
            label="Exceedance days"
            value={String(exceedanceDays)}
            hint="Peak ISPU above 100"
          />
        </Panel>
        <Panel padded={false}>
          <StatBlock
            label="Worst day"
            value={worstDay ? String(worstDay.ispu) : "—"}
            unit="ISPU"
            hint={worstDay ? wibDate(worstDay.date) : undefined}
            tone={worstDay ? ispuColor[worstDay.severity] : undefined}
          />
        </Panel>
        <Panel padded={false}>
          <StatBlock
            label="Parameters"
            value={String(metrics.length)}
            hint="With a defined limit"
          />
        </Panel>
      </Grid>

      <Panel
        title="Exposure performance"
        caption="Last 48 hours of half-hourly readings, against the 24-hour ambient standards in PP 22/2021 and advisory thresholds for meteorology."
        padded={false}
      >
        <div className={styles.table}>
          <DataTable
            columns={metricColumns}
            rows={metrics}
            rowKey={(m) => m.parameter}
            empty="No parameter at this station has a defined limit"
          />
        </div>
      </Panel>

      <Panel
        title="Daily compliance record"
        caption={`Peak ISPU per day · ${period}`}
        padded={false}
      >
        <div className={styles.table}>
          <DataTable
            columns={dailyColumns}
            rows={dailyDesc}
            rowKey={(d) => d.date}
            empty="No daily history published for this station"
          />
        </div>
      </Panel>

      <Split ratio="wide">
        <Panel title="Reporting basis" caption="What these figures are drawn from.">
          <Stack>
            <div className={styles.basis}>
              <span className={styles.basisLabel}>Source</span>
              <p className={styles.basisText}>
                Dinas Lingkungan Hidup DKI Jakarta public air quality network
                (SPKU), published at udara.jakarta.go.id. Readings are retrieved
                directly from the portal; no value is entered manually.
              </p>
            </div>
            <div className={styles.basis}>
              <span className={styles.basisLabel}>Index</span>
              <p className={styles.basisText}>
                ISPU bands follow Permen LHK 14/2020. Ambient concentration
                limits are the 24-hour standards in PP 22/2021 Annex VII.
              </p>
            </div>
            <div className={styles.basis}>
              <span className={styles.basisLabel}>Station</span>
              <p className={styles.basisText}>
                {detail.name}
                {detail.code ? ` (${detail.code})` : ""}
                {detail.address ? ` — ${detail.address}` : ""}
              </p>
            </div>
          </Stack>
        </Panel>

        <Stack>
          <Panel title="Scope and limitations">
            <ul className={styles.limits}>
              <li>
                Figures describe ambient air at this monitoring station, not
                workplace exposure at any particular site.
              </li>
              <li>
                Hours over limit are derived from half-hourly samples across the
                48-hour window, not the full reporting period.
              </li>
              <li>
                No approval audit trail is shown: the platform has no
                authentication or approval store yet, so there are no approvals
                to report.
              </li>
            </ul>
          </Panel>

          <Panel title="Frameworks">
            <div className={styles.frameworks}>
              {["PP 22/2021", "Permen LHK 14/2020", "Permenaker 5/2018"].map((f) => (
                <div key={f} className={styles.framework}>
                  <Icon name="check" size={13} />
                  {f}
                </div>
              ))}
            </div>
            {detail.updatedAt ? (
              <p className={styles.generated}>
                Readings as of {wibDateTime(detail.updatedAt)} WIB
              </p>
            ) : null}
          </Panel>
        </Stack>
      </Split>
    </>
  );
}
