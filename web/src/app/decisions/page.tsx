import Link from "next/link";
import { Icon } from "@/components/atoms/Icon/Icon";
import { Panel } from "@/components/atoms/Panel/Panel";
import { Tag } from "@/components/atoms/Tag/Tag";
import { MetricTile } from "@/components/molecules/MetricTile/MetricTile";
import { RiskBar } from "@/components/molecules/RiskBar/RiskBar";
import { StatBlock } from "@/components/molecules/StatBlock/StatBlock";
import { PageHeader } from "@/components/organisms/PageHeader/PageHeader";
import { ServiceNotice } from "@/components/organisms/ServiceNotice/ServiceNotice";
import { Grid, Split, Stack } from "@/components/templates/PageSection/PageSection";
import { getDecision } from "@/lib/api";
import { clock, hour, severityColor, severityLabel } from "@/lib/format";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function DecisionsPage({
  searchParams,
}: {
  searchParams: Promise<{ site?: string }>;
}) {
  const { site } = await searchParams;
  let d;
  try {
    d = await getDecision(site);
  } catch (err) {
    return <ServiceNotice error={err} />;
  }

  const worst = [...d.cards].sort((a, b) => b.forecast / b.limit - a.forecast / a.limit)[0];

  return (
    <>
      <PageHeader
        eyebrow="Act"
        title="Site decision"
        description="One consolidated judgement for the site, derived from every connected sensor and the 24-hour exposure forecast."
        meta={`Generated ${clock(d.generated_at)}`}
      />

      <Grid columns={6}>
        {d.cards.map((c) => (
          <MetricTile key={c.parameter} card={c} />
        ))}
      </Grid>

      <Split ratio="wide">
        <Panel
          title="Why this decision"
          caption="Each line is a forecast threshold breach that drives the risk index."
        >
          <Stack>
            {d.insights.length === 0 ? (
              <p className={styles.clear}>
                No parameter is forecast to breach its shift limit in the next 24 hours.
              </p>
            ) : (
              d.insights.map((i) => (
                <div key={i.parameter} className={styles.insight}>
                  <span
                    className={styles.insightRail}
                    style={{ background: severityColor[i.severity] }}
                  />
                  <div className={styles.insightBody}>
                    <div className={styles.insightTop}>
                      <span className={styles.insightLabel}>{i.label}</span>
                      <Tag tone={i.severity}>{severityLabel[i.severity]}</Tag>
                    </div>
                    <p className={styles.insightText}>{i.text}</p>
                    <span className={styles.insightTime}>
                      <Icon name="clock" size={12} />
                      Peak window {hour(i.hour)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </Stack>
        </Panel>

        <Stack>
          <Panel>
            <RiskBar score={d.risk_score} label={d.risk_label} level={d.risk_level} />
          </Panel>

          <Panel padded={false}>
            <div className={styles.stats}>
              <StatBlock
                label="At risk"
                value={`${d.at_risk_count}/${d.total_params}`}
                hint="Parameters above limit"
              />
              <StatBlock
                label="Driving parameter"
                value={worst?.label ?? "—"}
                hint={worst ? `peak ${hour(worst.peak_hour)}` : undefined}
              />
            </div>
          </Panel>

          <Panel title="Next step">
            <p className={styles.next}>
              {d.actions.length} control{d.actions.length === 1 ? "" : "s"} are proposed for this
              forecast window. Review and approve them before the next shift handover.
            </p>
            <Link href="/actions" className={styles.link}>
              Open action queue
              <Icon name="chevron" size={13} />
            </Link>
          </Panel>
        </Stack>
      </Split>
    </>
  );
}
