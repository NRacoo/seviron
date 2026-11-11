import PageHero from "@/components/ui/page-hero";
import Reveal from "@/components/ui/reveal";
import CtaSection from "@/components/section/cta";

export const metadata = {
  title: "About Us",
  description:
    "SERAVIN exists to make environmental monitoring more proactive through connected technology and actionable intelligence.",
};

const story = [
  "Industrial growth creates opportunities, but it also carries an environmental responsibility. When emissions and air quality are not monitored continuously, abnormal conditions can remain unnoticed until they develop into serious environmental and business concerns. In some cases, companies only recognize the scale of a problem after facing regulatory action, financial penalties, or damage to their reputation.",
  "We believe environmental management should not begin after a problem has occurred. Organizations need better visibility, earlier insights, and the ability to respond with confidence.",
  "That belief inspired SERAVIN — Secure Environmental Organization. We bring connected sensors and an intelligent digital platform together to help organizations monitor environmental conditions, anticipate potential risks, and make more informed decisions.",
];

const values = [
  {
    title: "Innovation",
    body: "We use technology and data to create smarter ways to understand environmental conditions.",
  },
  {
    title: "Responsibility",
    body: "We encourage organizations to recognize and manage their environmental impact proactively.",
  },
  {
    title: "Reliability",
    body: "We aim to provide dependable data and clear information that supports better decisions.",
  },
  {
    title: "Sustainability",
    body: "We support long-term thinking that considers both operational needs and environmental well-being.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="Born from an Environmental Challenge"
        lede="SERAVIN exists to make environmental monitoring more proactive through connected technology and actionable intelligence."
      />

      <section className="border-b border-line">
        <div className="shell py-24 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.6fr_1.4fr]">
            <Reveal>
              <p className="eyebrow">Our story</p>
            </Reveal>
            <div className="max-w-2xl space-y-7">
              {story.map((paragraph, i) => (
                <Reveal key={i} delay={0.08 * i}>
                  <p className="text-base leading-relaxed text-stone lg:text-[1.0625rem] lg:leading-[1.8]">
                    {paragraph}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="shell grid gap-px border-x border-line bg-line md:grid-cols-2">
          <Reveal className="bg-sand p-10 lg:p-14">
            <p className="eyebrow">Our Mission</p>
            <p className="display mt-7 text-[1.5rem] leading-[1.35] lg:text-[1.875rem]">
              To empower organizations with connected environmental monitoring
              and predictive intelligence that support early risk detection,
              informed decisions, and responsible environmental management.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="bg-sand p-10 lg:p-14">
            <p className="eyebrow">Our Vision</p>
            <p className="display mt-7 text-[1.5rem] leading-[1.35] lg:text-[1.875rem]">
              To contribute to a future where industrial progress and
              environmental responsibility work together, supported by
              accessible data, intelligent technology, and proactive action.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="shell py-24 lg:py-32">
          <Reveal>
            <p className="eyebrow">Our values</p>
          </Reveal>
          <div className="mt-14 grid gap-x-16 gap-y-12 sm:grid-cols-2">
            {values.map((value, i) => (
              <Reveal key={value.title} delay={0.07 * i}>
                <div className="border-t border-line pt-7">
                  <h3 className="text-lg tracking-[-0.01em]">{value.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone">
                    {value.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaSection
        headline="Get to Know SERAVIN."
        body="We would like to understand your environmental monitoring context. Start a conversation with our team."
        label="Talk to Our Team"
      />
    </>
  );
}
