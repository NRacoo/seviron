import { Panel } from "@/components/atoms/Panel/Panel";
import { Tag } from "@/components/atoms/Tag/Tag";
import { LineChart } from "@/components/atoms/Chart/LineChart";
import { MetricTile } from "@/components/molecules/MetricTile/MetricTile";
import { ForecastExplorer } from "@/components/organisms/ForecastExplorer/ForecastExplorer";
import { PageHeader } from "@/components/organisms/PageHeader/PageHeader";
import { ServiceNotice } from "@/components/organisms/ServiceNotice/ServiceNotice";
import { StationBanner } from "@/components/organisms/StationBanner/StationBanner";
import { Grid, Stack } from "@/components/templates/PageSection/PageSection";
import { metricToCard } from "@/lib/adapt";
import { wibClock } from "@/lib/format";
import { ispuColor } from "@/lib/ispu";
import { resolveStation } from "@/lib/selection";
import styles from "./page.module.css";

export const revalidate = 600;

export const metadata = {
  title: "Exposure forecast — Seviron",
  description:
    "Observed 48-hour air quality and the three-day SILAM dispersion forecast for a Jakarta monitoring station.",
};

export default async function ForecastPage({
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

  const pollutants = detail.metrics.filter((m) => m.regulated).map(metricToCard);
  const weather = detail.metrics.filter((m) => !m.regulated).map(metricToCard);

  const peak = detail.forecast.reduce(
    (a, d) => (d.ispu > a.ispu ? d : a),
    detail.forecast[0],
  );

  return (
    <>
      <PageHeader
        eyebrow="Monitor"
        title="Exposure forecast"
        description="Observed readings over the past 48 hours, against the three-day dispersion forecast published for this station. The forecast is modelled as an index, so pollutant cards report what was actually measured."
        meta={detail.updatedAt ? `Updated ${wibClock(detail.updatedAt)} WIB` : "Live"}
      />

      <StationBanner detail={detail} fellBack={fellBack} />

      {detail.forecast.length > 0 ? (
        <Panel
          title="Three-day outlook"
          caption="SILAM dispersion model, published by DLH Jakarta."
          aside={
            peak ? (
              <Tag tone={peak.severity}>
                Peak {peak.label} · ISPU {peak.ispu}
              </Tag>
            ) : undefined
          }
        >
          <div className={styles.days}>
            {detail.forecast.map((d) => (
              <div key={d.dateIso} className={styles.day}>
                <span className={styles.dayLabel}>{d.label}</span>
                <span className={styles.dayDate}>{d.date}</span>
                <span
                  className={`${styles.dayValue} u-num`}
                  style={{ color: ispuColor[d.severity] }}
                >
                  {d.ispu}
                </span>
                <span className={styles.dayStatus}>{d.status}</span>
              </div>
            ))}
          </div>

          {detail.forecastHours.length > 1 ? (
            <div className={styles.chart}>
              <LineChart
                unit="ISPU"
                limit={100}
                height={190}
                series={[
                  {
                    points: detail.ispuHistory.map((p) => ({ at: p.at, value: p.value })),
                    color: "var(--ink-3)",
                  },
                  {
                    points: detail.forecastHours.map((p) => ({ at: p.at, value: p.value })),
                    color: ispuColor[detail.severity],
                    dashed: true,
                    fill: true,
                  },
                ]}
              />

              <div className={styles.legend}>
                <span className={styles.key}>
                  <span className={styles.lineSolid} />
                  Observed 48 h
                </span>
                <span className={styles.key}>
                  <span
                    className={styles.lineDashed}
                    style={{ borderTopColor: ispuColor[detail.severity] }}
                  />
                  Forecast H+1 to H+3
                </span>
                <span className={styles.key}>
                  <span className={styles.lineLimit} />
                  Healthy limit (ISPU 100)
                </span>
              </div>
            </div>
          ) : null}
        </Panel>
      ) : null}

      <Stack>
        <h2 className={styles.sectionTitle}>Measured pollutants</h2>
        <Grid columns={pollutants.length >= 3 ? 3 : 2}>
          {pollutants.map((c) => (
            <MetricTile key={c.parameter} card={c} />
          ))}
        </Grid>
      </Stack>

      {/* The index is already charted above, so the explorer covers the
          measured series it does not duplicate. */}
      <ForecastExplorer cards={[...pollutants, ...weather]} />
    </>
  );
}
