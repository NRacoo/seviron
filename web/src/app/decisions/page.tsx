import Link from "next/link";
import { Icon } from "@/components/atoms/Icon/Icon";
import { Panel } from "@/components/atoms/Panel/Panel";
import { Tag } from "@/components/atoms/Tag/Tag";
import { MetricTile } from "@/components/molecules/MetricTile/MetricTile";
import { RiskBar } from "@/components/molecules/RiskBar/RiskBar";
import { StatBlock } from "@/components/molecules/StatBlock/StatBlock";
import { PageHeader } from "@/components/organisms/PageHeader/PageHeader";
import { ServiceNotice } from "@/components/organisms/ServiceNotice/ServiceNotice";
import { StationBanner } from "@/components/organisms/StationBanner/StationBanner";
import { Grid, Split, Stack } from "@/components/templates/PageSection/PageSection";
import { actionsFromStation, ispuToCard, metricToCard, riskFromStation } from "@/lib/adapt";
import { hour, num, severityColor, severityLabel, wibClock, wibHourOf } from "@/lib/format";
import { resolveStation } from "@/lib/selection";
import type { StationDetail } from "@/types/jakarta";
import styles from "./page.module.css";

export const revalidate = 600;

export const metadata = {
  title: "Site decision — Seviron",
  description:
    "One consolidated air quality judgement for a Jakarta monitoring station, with the readings that drive it.",
};

interface Reason {
  key: string;
  label: string;
  text: string;
  hour: number;
  severity: "good" | "moderate" | "high" | "danger";
}

/**
 * The evidence behind the verdict: every regulatory or advisory threshold the
 * station has actually crossed, plus the forecast if it breaches the healthy
 * band. Each line is traceable to a reading, never inferred.
 */
function reasons(d: StationDetail): Reason[] {
  const out: Reason[] = [];

  const peak = d.forecastHours.reduce(
    (a, p) => (p.value > a.value ? p : a),
    { at: "", value: 0 },
  );

  if (d.ispu > 100) {
    out.push({
      key: "ispu-now",
      label: "Air pollution index",
      text: `ISPU is ${d.ispu} (${d.status}), above the healthy limit of 100. ${d.dominantLabel} is the dominant pollutant.`,
      hour: d.updatedAt ? wibHourOf(d.updatedAt) : 0,
      severity: d.severity,
    });
  }

  if (peak.value > 100) {
    out.push({
      key: "ispu-forecast",
      label: "Forecast index",
      text: `The dispersion forecast peaks at ISPU ${peak.value}, above the healthy limit. Plan exposure controls for this window.`,
      hour: peak.at ? wibHourOf(peak.at) : 0,
      severity: peak.value > 200 ? "danger" : "high",
    });
  }

  for (const m of d.metrics) {
    if (m.limit === null || m.max === null || m.max <= m.limit) continue;

    const overSamples = m.history.filter((p) => p.value > m.limit!).length;
    const hours = Math.round(overSamples / 2);

    out.push({
      key: m.code,
      label: m.label,
      text: m.regulated
        ? `Peaked at ${num(m.max)} ${m.unit} against a ${num(m.limit)} ${m.unit} ambient standard, exceeding it for about ${hours} h of the last 48.`
        : `Reached ${num(m.max)} ${m.unit}, above the ${num(m.limit)} ${m.unit} advisory threshold for outdoor work.`,
      hour: m.history.length
        ? wibHourOf(m.history.reduce((a, b) => (b.value > a.value ? b : a)).at)
        : 0,
      severity: m.severity,
    });
  }

  return out;
}

export default async function DecisionsPage({
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
  const why = reasons(detail);
  const actions = actionsFromStation(detail);
  const recommended = actions.filter((a) => a.enabled);

  const cards = [ispuToCard(detail), ...detail.metrics.filter((m) => m.regulated).map(metricToCard)];
  const breaching = detail.metrics.filter(
    (m) => m.limit !== null && m.max !== null && m.max > m.limit,
  );

  return (
    <>
      <PageHeader
        eyebrow="Act"
        title="Site decision"
        description="One consolidated judgement for this location, derived from its live readings and the published dispersion forecast."
        meta={detail.updatedAt ? `Generated ${wibClock(detail.updatedAt)} WIB` : "Live"}
      />

      <StationBanner detail={detail} fellBack={fellBack} />

      <Grid columns={cards.length >= 3 ? 3 : 2}>
        {cards.map((c) => (
          <MetricTile key={c.parameter} card={c} />
        ))}
      </Grid>

      <Split ratio="wide">
        <Panel
          title="Why this decision"
          caption="Each line is a threshold the station's own readings have crossed."
        >
          <Stack>
            {why.length === 0 ? (
              <p className={styles.clear}>
                No parameter has crossed its limit in the last 48 hours, and the
                forecast stays within the healthy band. Normal operations.
              </p>
            ) : (
              why.map((r) => (
                <div key={r.key} className={styles.insight}>
                  <span
                    className={styles.insightRail}
                    style={{ background: severityColor[r.severity] }}
                  />
                  <div className={styles.insightBody}>
                    <div className={styles.insightTop}>
                      <span className={styles.insightLabel}>{r.label}</span>
                      <Tag tone={r.severity}>{severityLabel[r.severity]}</Tag>
                    </div>
                    <p className={styles.insightText}>{r.text}</p>
                    <span className={styles.insightTime}>
                      <Icon name="clock" size={12} />
                      Peak window {hour(r.hour)} WIB
                    </span>
                  </div>
                </div>
              ))
            )}
          </Stack>
        </Panel>

        <Stack>
          <Panel>
            <RiskBar score={risk.score} label={risk.label} level={risk.level} />
          </Panel>

          <Panel padded={false}>
            <div className={styles.stats}>
              <StatBlock
                label="Over limit"
                value={`${breaching.length}/${detail.metrics.length}`}
                hint="Parameters in the last 48 h"
              />
              <StatBlock
                label="Dominant pollutant"
                value={detail.dominantLabel}
                hint={`ISPU ${detail.ispu}`}
              />
            </div>
          </Panel>

          <Panel title="Next step">
            <p className={styles.next}>
              {recommended.length === 0
                ? "No exposure controls are required at the current band. The action queue stays on standby."
                : `${recommended.length} control${recommended.length === 1 ? " is" : "s are"} recommended for this band. Review and approve them before the next shift handover.`}
            </p>
            <Link
              href={`/actions?station=${detail.id}`}
              className={styles.link}
            >
              Open action queue
              <Icon name="chevron" size={13} />
            </Link>
          </Panel>
        </Stack>
      </Split>
    </>
  );
}
