import { Panel } from "@/components/atoms/Panel/Panel";
import { Tag } from "@/components/atoms/Tag/Tag";
import { StatBlock } from "@/components/molecules/StatBlock/StatBlock";
import { ActionQueue } from "@/components/organisms/ActionQueue/ActionQueue";
import { PageHeader } from "@/components/organisms/PageHeader/PageHeader";
import { ServiceNotice } from "@/components/organisms/ServiceNotice/ServiceNotice";
import { Grid, Split, Stack } from "@/components/templates/PageSection/PageSection";
import { getActions } from "@/lib/api";
import { hour, severityColor } from "@/lib/format";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function ActionsPage({
  searchParams,
}: {
  searchParams: Promise<{ site?: string }>;
}) {
  const { site } = await searchParams;
  let bundle;
  try {
    bundle = await getActions(site);
  } catch (err) {
    return <ServiceNotice error={err} />;
  }

  const owners = new Set(bundle.actions.map((a) => a.owner)).size;

  return (
    <>
      <PageHeader
        eyebrow="Act"
        title="Operational controls"
        description="Mitigations mapped from each forecast exceedance to an accountable owner and an execution window."
        meta={`Risk index ${bundle.risk_score}`}
      />

      <Grid columns={3}>
        <Panel padded={false}>
          <StatBlock
            label="Proposed controls"
            value={String(bundle.actions.length)}
            hint="For the next shift"
          />
        </Panel>
        <Panel padded={false}>
          <StatBlock label="Accountable teams" value={String(owners)} hint="Distinct owners" />
        </Panel>
        <Panel padded={false}>
          <StatBlock
            label="Triggers"
            value={String(bundle.insights.length)}
            hint="Forecast exceedances"
          />
        </Panel>
      </Grid>

      <Split ratio="wide">
        <ActionQueue actions={bundle.actions} />

        <Stack>
          <Panel title="Triggering conditions" caption="What each control responds to.">
            {bundle.insights.length === 0 ? (
              <p className={styles.none}>No exceedance forecast. Controls remain on standby.</p>
            ) : (
              <ul className={styles.triggers}>
                {bundle.insights.map((i) => (
                  <li key={i.parameter} className={styles.trigger}>
                    <span
                      className={styles.dot}
                      style={{ background: severityColor[i.severity] }}
                    />
                    <div>
                      <span className={styles.triggerLabel}>{i.label}</span>
                      <span className={styles.triggerHour}>peak {hour(i.hour)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Compliance basis">
            <div className={styles.refs}>
              {Array.from(new Set(bundle.actions.map((a) => a.reference))).map((r) => (
                <Tag key={r}>{r}</Tag>
              ))}
            </div>
            <p className={styles.refNote}>
              Each approved control cites its governing standard and is retained in the ESG audit
              trail for external assurance.
            </p>
          </Panel>
        </Stack>
      </Split>
    </>
  );
}
