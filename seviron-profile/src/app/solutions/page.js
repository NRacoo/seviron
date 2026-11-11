import PageHero from "@/components/ui/page-hero";
import Reveal from "@/components/ui/reveal";
import CtaSection from "@/components/section/cta";

export const metadata = {
  title: "Solutions",
  description:
    "One connected platform across monitoring, forecasting, and decision support.",
};

const solutions = [
  {
    id: "monitoring",
    index: "01",
    title: "Monitoring — Understand What Is Happening",
    body: "SERAVIN connects IoT-enabled environmental sensors to a centralized platform, providing continuous visibility into measured environmental conditions. Teams can review current readings, monitor sensor status, and access historical records to better understand conditions across their facilities.",
    capabilities: [
      "Connected sensor data collection.",
      "Real-time or near-real-time readings, depending on device connectivity and transmission interval.",
      "Centralized dashboard for monitored locations and devices.",
      "Historical data visualization and measurement records.",
      "Sensor connectivity and status visibility, where supported.",
    ],
  },
  {
    id: "forecast",
    index: "02",
    title: "Forecast & Prediction — Anticipate What Could Happen",
    body: "Current readings show the condition at a specific moment. Historical patterns and data analysis can provide additional context about what may happen next. SERAVIN aims to transform available environmental data into predictive insights that help teams identify emerging trends and anticipate potential threshold exceedances.",
    capabilities: [
      "Environmental trend analysis using available historical data.",
      "Forecasting of selected environmental parameters, where supported by the deployed model.",
      "Identification of patterns that may indicate increasing environmental risk.",
      "Potential threshold-exceedance predictions with a stated forecast horizon.",
      "Clear presentation of forecast period, confidence, and limitations where applicable.",
    ],
  },
  {
    id: "decision",
    index: "03",
    title: "Decision & Action — Know What to Do Next",
    body: "Information creates value when it supports action. SERAVIN turns monitored conditions and predictive insights into alerts and decision-support information, helping relevant personnel investigate abnormalities, prioritize potential risks, and determine appropriate follow-up actions.",
    capabilities: [
      "Configurable alert thresholds and notification rules.",
      "Alerts for abnormal readings and predicted potential risks, where supported.",
      "Risk prioritization to help teams focus on important events.",
      "Suggested response steps or operational guidance, if configured.",
      "Event history to support review and follow-up.",
    ],
  },
];

export default function SolutionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="One Platform. Three Layers of Environmental Intelligence."
        lede="Environmental management requires more than collecting measurements. Teams need to understand what is happening, anticipate what may happen next, and decide how to respond. SERAVIN connects these capabilities in one integrated platform."
      />

      {solutions.map((solution) => (
        <section
          key={solution.id}
          id={solution.id}
          className="scroll-mt-24 border-b border-line"
        >
          <div className="shell py-20 lg:py-28">
            <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
              <div>
                <Reveal>
                  <span className="text-[11px] tracking-[0.18em] text-stone">
                    {solution.index}
                  </span>
                  <h2 className="display mt-6 text-[1.75rem] sm:text-[2.25rem] lg:text-[2.75rem]">
                    {solution.title}
                  </h2>
                </Reveal>
                <Reveal delay={0.1}>
                  <p className="prose-lede mt-7 max-w-xl">{solution.body}</p>
                </Reveal>
              </div>

              <div className="lg:pt-16">
                <Reveal delay={0.14}>
                  <p className="eyebrow">Capabilities</p>
                </Reveal>
                <ul className="mt-6">
                  {solution.capabilities.map((item, i) => (
                    <Reveal key={item} delay={0.05 * i}>
                      <li className="flex gap-5 border-b border-line py-4 text-sm leading-relaxed text-stone">
                        <span
                          className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-moss"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    </Reveal>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="border-b border-line">
        <div className="shell py-24 lg:py-32">
          <Reveal>
            <p className="eyebrow">Integrated value</p>
            <h2 className="display mt-6 max-w-3xl text-[2rem] sm:text-[2.5rem] lg:text-[3.25rem]">
              A Continuous Cycle of Environmental Intelligence
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="prose-lede mt-8 max-w-2xl">
              Monitoring provides the data. Forecasting adds forward-looking
              insight. Decision support helps turn that insight into action. As
              new data becomes available, the cycle continues — helping
              organizations build a more informed and proactive environmental
              management process.
            </p>
          </Reveal>
        </div>
      </section>

      <CtaSection
        headline="See the Platform in Context."
        body="Request a walkthrough of monitoring, forecasting, and decision support configured around your parameters and sites."
        label="Request a Product Demo"
      />
    </>
  );
}
