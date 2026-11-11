import { Panel } from "@/components/atoms/Panel/Panel";
import { Tag } from "@/components/atoms/Tag/Tag";
import { StatBlock } from "@/components/molecules/StatBlock/StatBlock";
import { ActionQueue } from "@/components/organisms/ActionQueue/ActionQueue";
import { PageHeader } from "@/components/organisms/PageHeader/PageHeader";
import { ServiceNotice } from "@/components/organisms/ServiceNotice/ServiceNotice";
import { StationBanner } from "@/components/organisms/StationBanner/StationBanner";
import { Grid, Split, Stack } from "@/components/templates/PageSection/PageSection";
import { actionsFromStation, riskFromStation } from "@/lib/adapt";
import { num } from "@/lib/format";
import { ispuColor } from "@/lib/ispu";
import { resolveStation } from "@/lib/selection";
import styles from "./page.module.css";

export const revalidate = 600;

export const metadata = {
  title: "Operational controls — Seviron",
  description:
    "Exposure controls implied by a Jakarta station's live air quality band, mapped to accountable owners.",
};

export default async function ActionsPage({
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

  const risk = riskFromStation(detail);
  const actions = actionsFromStation(detail);
  const recommended = actions.filter((a) => a.enabled);
  const owners = new Set(recommended.map((a) => a.owner)).size;

  // What the controls respond to: the index now, the forecast peak, and any
  // measured limit breach.
  const peak = detail.forecastHours.reduce((a, p) => Math.max(a, p.value), 0);
  const breaches = detail.metrics.filter(
    (m) => m.limit !== null && m.max !== null && m.max > m.limit,
  );

  return (
    <>
      <PageHeader
        eyebrow="Act"
        title="Operational controls"
        description="Exposure controls implied by this station's air quality band, each mapped to an accountable owner, an execution window, and the standard it derives from."
        meta={`Risk index ${risk.score}`}
      />

      <StationBanner detail={detail} fellBack={fellBack} />

      <Grid columns={3}>
        <Panel padded={false}>
          <StatBlock
            label="Recommended now"
            value={String(recommended.length)}
            hint={`of ${actions.length} in the playbook`}
          />
        </Panel>
        <Panel padded={false}>
          <StatBlock label="Accountable teams" value={String(owners)} hint="Distinct owners" />
        </Panel>
        <Panel padded={false}>
          <StatBlock
            label="Forecast peak"
            value={String(peak || detail.ispu)}
            unit="ISPU"
            hint="Next 72 hours"
            tone={ispuColor[risk.level]}
          />
        </Panel>
      </Grid>

      <Split ratio="wide">
        <ActionQueue actions={actions} />

        <Stack>
          <Panel
            title="Triggering conditions"
            caption="The readings these controls respond to."
          >
            <ul className={styles.triggers}>
              <li className={styles.trigger}>
                <span
                  className={styles.dot}
                  style={{ background: ispuColor[detail.severity] }}
                />
                <div>
                  <span className={styles.triggerLabel}>
                    ISPU now {detail.ispu}
                  </span>
                  <span className={styles.triggerHour}>
                    {detail.status} · {detail.dominantLabel}
                  </span>
                </div>
              </li>

              {peak > 0 ? (
                <li className={styles.trigger}>
                  <span
                    className={styles.dot}
                    style={{ background: ispuColor[risk.level] }}
                  />
                  <div>
                    <span className={styles.triggerLabel}>
                      Forecast peak {peak}
                    </span>
                    <span className={styles.triggerHour}>
                      SILAM dispersion, H+1 to H+3
                    </span>
                  </div>
                </li>
              ) : null}

              {breaches.map((m) => (
                <li key={m.code} className={styles.trigger}>
                  <span
                    className={styles.dot}
                    style={{ background: ispuColor[m.severity] }}
                  />
                  <div>
                    <span className={styles.triggerLabel}>
                      {m.label} {num(m.max ?? 0)} {m.unit}
                    </span>
                    <span className={styles.triggerHour}>
                      over {num(m.limit ?? 0)} {m.unit}
                      {m.regulated ? " ambient standard" : " advisory threshold"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Compliance basis">
            <div className={styles.refs}>
              {Array.from(new Set(actions.map((a) => a.reference))).map((r) => (
                <Tag key={r}>{r}</Tag>
              ))}
            </div>
            <p className={styles.refNote}>
              Each control cites the standard it derives from. Approval is
              recorded in this browser session only — it is not yet written to a
              server-side audit store.
            </p>
          </Panel>
        </Stack>
      </Split>
    </>
  );
}
