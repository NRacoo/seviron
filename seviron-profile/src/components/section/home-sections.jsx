import Link from "next/link";
import Reveal from "@/components/ui/reveal";
import VideoShowcase from "@/components/ui/video-showcase";
import CtaSection from "@/components/section/cta";
import { pillars } from "@/lib/site";

const workflow = [
  "Connect sensors",
  "Collect environmental data",
  "Analyze conditions and trends",
  "Identify potential risks",
  "Notify the right people",
];

export default function HomeSections() {
  return (
    <>
      <section className="border-b border-line bg-sand">
        <div className="shell py-24 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <p className="eyebrow">The problem</p>
              <h2 className="display mt-6 text-[2rem] sm:text-[2.5rem] lg:text-[3rem]">
                When Environmental Risks Become Business Risks
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="prose-lede lg:pt-20">
                Industrial operations can generate environmental impacts that
                are difficult to identify without continuous monitoring. When
                abnormal conditions go unnoticed, organizations may face
                operational disruption, regulatory exposure, financial
                penalties, and reputational damage. The challenge is not only
                detecting a problem — it is detecting it early enough to
                respond.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-sand">
        <div className="shell py-24 lg:py-32">
          <Reveal>
            <p className="eyebrow">Our approach</p>
            <h2 className="display mt-6 max-w-3xl text-[2rem] sm:text-[2.5rem] lg:text-[3.25rem]">
              Beyond Monitoring. Toward Intelligent Prevention.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="prose-lede mt-8 max-w-2xl">
              SEVIRON brings environmental data, predictive insights, and
              decision support into one connected ecosystem. Instead of relying
              only on periodic checks or reacting after an issue occurs, teams
              gain better visibility into current conditions and potential
              risks.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-line bg-sand">
        <div className="shell py-24 lg:py-32">
          <Reveal>
            <p className="eyebrow">The platform</p>
            <h2 className="display mt-6 max-w-2xl text-[2rem] sm:text-[2.5rem] lg:text-[3rem]">
              One Dashboard for Every Condition
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="mt-14">
              <VideoShowcase
                src="/images/SevironShort.mp4"
                poster="/images/demo.webp"
              />
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="prose-lede mt-8 max-w-2xl">
              Live readings, trend history, and risk signals in a single view —
              so teams can see what is happening and decide what to do next.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-line bg-sand">
        <div className="shell py-24 lg:py-32">
          <Reveal>
            <p className="eyebrow">Three layers of intelligence</p>
          </Reveal>
          <div className="mt-14 grid gap-px border border-line bg-line md:grid-cols-3">
            {pillars.map((pillar, i) => (
              <Reveal key={pillar.id} delay={0.08 * i}>
                <Link
                  href={`/solutions#${pillar.id}`}
                  className="group flex h-full flex-col justify-between bg-sand p-8 transition-colors duration-500 hover:bg-ink hover:text-sand lg:p-10"
                >
                  <div>
                    <span className="text-[11px] tracking-[0.18em] text-stone transition-colors group-hover:text-sand/55">
                      {pillar.index}
                    </span>
                    <h3 className="mt-8 text-xl tracking-[-0.01em] lg:text-2xl">
                      {pillar.title}
                    </h3>
                    <p className="mt-4 text-sm text-stone transition-colors group-hover:text-sand/80">
                      {pillar.lead}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-stone transition-colors group-hover:text-sand/65">
                      {pillar.body}
                    </p>
                  </div>
                  <span
                    className="mt-12 text-sm transition-transform duration-500 group-hover:translate-x-1"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-sand">
        <div className="shell py-24 lg:py-32">
          <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <p className="eyebrow">How it works</p>
              <h2 className="display mt-6 text-[2rem] sm:text-[2.5rem] lg:text-[3rem]">
                From Sensor Data to Informed Action
              </h2>
              <Link
                href="/how-it-works"
                className="mt-8 inline-flex items-center gap-2 text-sm text-ink"
              >
                See the full workflow
                <span aria-hidden="true">→</span>
              </Link>
            </Reveal>
            <div>
              {workflow.map((step, i) => (
                <Reveal key={step} delay={0.06 * i}>
                  <div className="flex items-baseline gap-6 border-b border-line py-5">
                    <span className="text-[11px] tracking-[0.18em] text-stone">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-base text-ink lg:text-lg">{step}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
