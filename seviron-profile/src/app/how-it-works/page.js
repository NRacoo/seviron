import PageHero from "@/components/ui/page-hero";
import Reveal from "@/components/ui/reveal";
import CtaSection from "@/components/section/cta";

export const metadata = {
  title: "How It Works",
  description:
    "A connected process moves data from field sensors to analysis, alerts, and operational response.",
};

const steps = [
  {
    index: "01",
    title: "Sense",
    body: "Sensors installed at designated monitoring points collect measurements for the environmental parameters supported by the deployed devices.",
  },
  {
    index: "02",
    title: "Connect",
    body: "Measurements are transmitted to the SEVIRON platform through the available communication network. Transmission frequency depends on device and network configuration.",
  },
  {
    index: "03",
    title: "Monitor",
    body: "The platform organizes incoming data and presents current readings, device information, and historical trends.",
  },
  {
    index: "04",
    title: "Forecast",
    body: "Available historical and real-time data is analyzed to identify trends and estimate potential future conditions for supported parameters.",
  },
  {
    index: "05",
    title: "Alert",
    body: "When configured thresholds are crossed or a supported prediction indicates potential risk, the platform can generate notifications for relevant personnel.",
  },
  {
    index: "06",
    title: "Respond",
    body: "Teams review the information, investigate the situation, and take appropriate corrective or preventive action.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How It Works"
        title="From Sensors to Smarter Environmental Decisions"
        lede="SEVIRON brings field-level environmental measurements into a connected digital workflow. Data is collected, transmitted, analyzed, and presented as information that supports timely decisions."
      />

      <section className="border-b border-line">
        <div className="shell py-20 lg:py-28">
          <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal key={step.index} delay={0.06 * i}>
                <div className="flex h-full flex-col bg-sand p-8 lg:p-10">
                  <span className="text-[11px] tracking-[0.18em] text-stone">
                    {step.index}
                  </span>
                  <h2 className="mt-8 text-xl tracking-[-0.01em]">
                    {step.title}
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-stone">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="shell py-24 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <p className="eyebrow">What users gain</p>
              <h2 className="display mt-6 text-[2rem] sm:text-[2.5rem] lg:text-[3rem]">
                Clarity at Every Stage
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="prose-lede lg:pt-20">
                SEVIRON helps teams move from fragmented readings to a clearer
                view of environmental conditions. By connecting monitoring,
                predictive insight, and decision support, the platform can help
                organizations respond with better context and timing.
              </p>
              <p className="mt-6 text-sm leading-relaxed text-stone">
                Available parameters, data intervals, prediction horizons, and
                notification channels depend on deployment configuration.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <CtaSection
        headline="Discuss Your Monitoring Needs."
        body="Tell us about your sites, parameters, and connectivity. Our team can outline a workflow that fits your operation."
        label="Discuss Your Monitoring Needs"
      />
    </>
  );
}
