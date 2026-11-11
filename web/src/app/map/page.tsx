import { Panel } from "@/components/atoms/Panel/Panel";
import { StatBlock } from "@/components/molecules/StatBlock/StatBlock";
import { PageHeader } from "@/components/organisms/PageHeader/PageHeader";
import { ServiceNotice } from "@/components/organisms/ServiceNotice/ServiceNotice";
import { SiteMapBoard } from "@/components/organisms/SiteMapBoard/SiteMapBoard";
import { Grid } from "@/components/templates/PageSection/PageSection";
import { getSiteMap } from "@/lib/api";
import { clock } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  let data;
  try {
    data = await getSiteMap();
  } catch (err) {
    return <ServiceNotice error={err} />;
  }

  const { summary } = data;
  const meanTone =
    summary.mean_risk >= 75
      ? "var(--crit)"
      : summary.mean_risk >= 50
        ? "var(--high)"
        : summary.mean_risk >= 25
          ? "var(--warn)"
          : "var(--ok)";

  return (
    <>
      <PageHeader
        eyebrow="Monitor"
        title="Site map"
        description={`Forecast risk across every monitored site in ${data.country}. Marker colour follows the worst forecast parameter, size follows the risk index.`}
        meta={`Updated ${clock(data.generated_at)}`}
      />

      <Grid columns={4}>
        <Panel padded={false}>
          <StatBlock label="Sites" value={String(summary.total)} hint="Monitored nationally" />
        </Panel>
        <Panel padded={false}>
          <StatBlock
            label="Sites at risk"
            value={String(summary.at_risk)}
            hint="One or more parameters over limit"
          />
        </Panel>
        <Panel padded={false}>
          <StatBlock label="Critical" value={String(summary.critical)} hint="Action required tonight" />
        </Panel>
        <Panel padded={false}>
          <StatBlock
            label="Mean risk index"
            value={String(summary.mean_risk)}
            unit="/100"
            hint={`Next ${data.horizon}`}
            tone={meanTone}
          />
        </Panel>
      </Grid>

      <SiteMapBoard sites={data.sites} horizon={data.horizon} />
    </>
  );
}
