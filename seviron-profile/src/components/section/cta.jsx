import Link from "next/link";
import Reveal from "@/components/ui/reveal";

export default function CtaSection({
  headline = "Make Environmental Awareness Part of Every Operation.",
  body = "Build a more proactive approach to environmental management with SERAVIN. Start a conversation with our team to explore the right monitoring approach for your facility.",
  label = "Talk to Our Team",
  href = "/contact",
}) {
  return (
    <section className="bg-ink text-sand">
      <div className="shell py-24 lg:py-32">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <Reveal>
            <h2 className="display max-w-2xl text-[2rem] sm:text-[2.75rem] lg:text-[3.5rem]">
              {headline}
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-[15px] leading-relaxed text-sand/65">{body}</p>
            <Link
              href={href}
              className="mt-8 inline-flex items-center gap-3 rounded-full border border-sand/30 px-7 py-3.5 text-[12px] tracking-[0.1em] transition-colors duration-300 hover:bg-sand hover:text-ink"
            >
              {label}
              <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
