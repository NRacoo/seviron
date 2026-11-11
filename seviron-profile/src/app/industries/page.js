import PageHero from "@/components/ui/page-hero";
import Reveal from "@/components/ui/reveal";
import CtaSection from "@/components/section/cta";

export const metadata = {
  title: "Industries",
  description:
    "Different environments have different monitoring needs. SEVIRON's connected approach can be configured around deployment requirements.",
};

const industries = [
  {
    title: "Manufacturing",
    body: "Monitor selected environmental parameters around production facilities and support operational teams in identifying abnormal conditions.",
  },
  {
    title: "Industrial Facilities",
    body: "Build a more consistent view of environmental conditions across designated monitoring points and facility areas.",
  },
  {
    title: "Energy & Utilities",
    body: "Support environmental observation around operational sites, subject to the relevant sensor parameters and deployment requirements.",
  },
  {
    title: "Educational Institutions",
    body: "Support air quality awareness and environmental data initiatives across campuses and learning environments.",
  },
  {
    title: "Government & Research",
    body: "Provide connected data collection infrastructure that may support environmental observation, analysis, and research activities.",
  },
  {
    title: "Corporate Campuses",
    body: "Improve visibility into selected environmental conditions across offices, shared spaces, and campus facilities.",
  },
];

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="Environmental Awareness Across Different Industries"
        lede="Every operating environment has its own environmental conditions and monitoring challenges. SEVIRON aims to help organizations build better visibility through connected sensing, predictive insight, and decision support."
      />

      <section className="border-b border-line">
        <div className="shell py-20 lg:py-28">
          <div className="grid gap-x-16 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry, i) => (
              <Reveal key={industry.title} delay={0.06 * i}>
                <div className="border-t border-line pt-7">
                  <h2 className="text-lg tracking-[-0.01em]">
                    {industry.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-stone">
                    {industry.body}
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
              <p className="eyebrow">Deployment fit</p>
              <h2 className="display mt-6 text-[2rem] sm:text-[2.5rem] lg:text-[3rem]">
                Designed Around Your Monitoring Requirements
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="prose-lede lg:pt-20">
                The right monitoring setup depends on the site, environmental
                parameters, sensor placement, connectivity, and operational
                objectives. SEVIRON works with organizations to understand these
                requirements and define an appropriate monitoring approach.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <CtaSection
        headline="Don't See Your Industry Listed?"
        body="Monitoring requirements vary by site and parameter. Tell us about your environment and we will explore an appropriate approach with you."
        label="Find the Right Solution for Your Facility"
      />
    </>
  );
}
