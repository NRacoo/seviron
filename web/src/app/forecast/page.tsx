import { MetricTile } from "@/components/molecules/MetricTile/MetricTile";
import { ForecastExplorer } from "@/components/organisms/ForecastExplorer/ForecastExplorer";
import { PageHeader } from "@/components/organisms/PageHeader/PageHeader";
import { ServiceNotice } from "@/components/organisms/ServiceNotice/ServiceNotice";
import { Grid } from "@/components/templates/PageSection/PageSection";
import { getForecast } from "@/lib/api";
import { clock } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ForecastPage({
  searchParams,
}: {
  searchParams: Promise<{ site?: string }>;
}) {
  const { site } = await searchParams;
  let bundle;
  try {
    bundle = await getForecast(site);
  } catch (err) {
    return <ServiceNotice error={err} />;
  }

  const atRisk = bundle.cards.filter((c) => c.at_risk).length;

  return (
    <>
      <PageHeader
        eyebrow="Monitor"
        title="Exposure forecast"
        description={`Projected concentrations for the next ${bundle.horizon}. ${atRisk} of ${bundle.cards.length} parameters are expected to exceed their shift limit.`}
        meta={`Updated ${clock(bundle.generated_at)}`}
      />

      <Grid columns={6}>
        {bundle.cards.map((c) => (
          <MetricTile key={c.parameter} card={c} />
        ))}
      </Grid>

      <ForecastExplorer cards={bundle.cards} />
    </>
  );
}
