import { Button } from "@/components/atoms/Button/Button";
import { Icon } from "@/components/atoms/Icon/Icon";
import { Panel } from "@/components/atoms/Panel/Panel";
import { Tag } from "@/components/atoms/Tag/Tag";
import { DataTable, type Column } from "@/components/molecules/DataTable/DataTable";
import { StatBlock } from "@/components/molecules/StatBlock/StatBlock";
import { PageHeader } from "@/components/organisms/PageHeader/PageHeader";
import { ServiceNotice } from "@/components/organisms/ServiceNotice/ServiceNotice";
import { Grid, Split, Stack } from "@/components/templates/PageSection/PageSection";
import { getESG } from "@/lib/api";
import { datetime, num, severityColor, severityLabel } from "@/lib/format";
import type { AuditEntry, ESGMetric } from "@/types/decision";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

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
  { key: "mean", header: "Mean", align: "right", render: (m) => <span className="u-num">{num(m.mean)}</span> },
  { key: "peak", header: "Peak", align: "right", render: (m) => <span className="u-num">{num(m.peak)}</span> },
  { key: "limit", header: "Limit", align: "right", render: (m) => <span className={`${styles.muted} u-num`}>{num(m.limit)}</span> },
  {
    key: "exceeded",
    header: "Hours over",
    align: "right",
    render: (m) => (
      <span className="u-num" style={{ color: m.exceeded_hours > 0 ? severityColor[m.status] : undefined }}>
        {m.exceeded_hours}
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

const auditColumns: Column<AuditEntry>[] = [
  {
    key: "ref",
    header: "Reference",
    width: "168px",
    render: (a) => <span className={styles.ref}>{a.ref}</span>,
  },
  { key: "action", header: "Control", render: (a) => a.action },
  { key: "actor", header: "Approved by", render: (a) => a.actor },
  { key: "at", header: "Timestamp", align: "right", render: (a) => <span className={styles.muted}>{datetime(a.at)}</span> },
  { key: "result", header: "Result", align: "right", render: (a) => <Tag tone="good">{a.result}</Tag> },
];

export default async function ESGPage({
  searchParams,
}: {
  searchParams: Promise<{ site?: string }>;
}) {
  const { site } = await searchParams;
  let report;
  try {
    report = await getESG(site);
  } catch (err) {
    return <ServiceNotice error={err} />;
  }

  const breaches = report.metrics.reduce((a, m) => a + m.exceeded_hours, 0);
  const tone =
    report.compliance_rate >= 95 ? "var(--ok)" : report.compliance_rate >= 85 ? "var(--warn)" : "var(--crit)";

  return (
    <>
      <PageHeader
        eyebrow="Report"
        title="ESG and compliance"
        description="Exposure performance against shift limits, with the approval trail that external assurance requires."
        meta={report.period}
        actions={
          <Button variant="secondary" size="md">
            <Icon name="download" size={14} />
            Export
          </Button>
        }
      />

      <Grid columns={4}>
        <Panel padded={false}>
          <StatBlock
            label="Compliance rate"
            value={String(report.compliance_rate)}
            unit="%"
            hint="Sample hours within limit"
            tone={tone}
          />
        </Panel>
        <Panel padded={false}>
          <StatBlock label="Exceedance hours" value={String(breaches)} hint="Across all parameters" />
        </Panel>
        <Panel padded={false}>
          <StatBlock label="Logged approvals" value={String(report.audit.length)} hint="This period" />
        </Panel>
        <Panel padded={false}>
          <StatBlock label="Parameters" value={String(report.metrics.length)} hint="Monitored continuously" />
        </Panel>
      </Grid>

      <Panel
        title="Exposure performance"
        caption={`${report.period} · aggregated from the normalized sensor series`}
        padded={false}
      >
        <div className={styles.table}>
          <DataTable columns={metricColumns} rows={report.metrics} rowKey={(m) => m.parameter} />
        </div>
      </Panel>

      <Split ratio="wide">
        <Panel title="Approval audit trail" caption="Immutable record of every approved control." padded={false}>
          <div className={styles.table}>
            <DataTable
              columns={auditColumns}
              rows={report.audit}
              rowKey={(a) => a.ref}
              empty="No controls approved in this period"
            />
          </div>
        </Panel>

        <Stack>
          <Panel title="Reporting frameworks">
            <div className={styles.frameworks}>
              {report.frameworks.map((f) => (
                <div key={f} className={styles.framework}>
                  <Icon name="check" size={13} />
                  {f}
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Statement">
            <p className={styles.statement}>
              This report is generated directly from sensor telemetry and the decision engine. No
              value is entered manually, so the exposure figures and the approval record reconcile
              to the same source of truth.
            </p>
            <p className={styles.generated}>Generated {datetime(report.generated_at)}</p>
          </Panel>
        </Stack>
      </Split>
    </>
  );
}
