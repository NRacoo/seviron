import Reveal from "@/components/ui/reveal";

export default function PageHero({ eyebrow, title, lede }) {
  return (
    <section className="border-b border-line pt-[136px] pb-16 lg:pt-[184px] lg:pb-24">
      <div className="shell">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="display mt-6 max-w-4xl text-[2.5rem] sm:text-[3.5rem] lg:text-[4.5rem]">
            {title}
          </h1>
        </Reveal>
        {lede ? (
          <Reveal delay={0.16}>
            <p className="prose-lede mt-8 max-w-2xl">{lede}</p>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
