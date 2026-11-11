import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { Story } from "@/components/sections/Story";
import { Gap } from "@/components/sections/Gap";
import { Product } from "@/components/sections/Product";
import { Demo } from "@/components/sections/Demo";
import { Outcome } from "@/components/sections/Outcome";
import { Solutions } from "@/components/sections/Solutions";
import { Why } from "@/components/sections/Why";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { site, type Section } from "@/lib/content";

const registry: Record<Section["id"], () => React.ReactNode> = {
  hero: Hero,
  story: Story,
  gap: Gap,
  product: Product,
  demo: Demo,
  outcome: Outcome,
  solutions: Solutions,
  why: Why,
  about: About,
  contact: Contact,
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {site.sections.map((s) => {
          const Component = registry[s.id];
          return <Component key={s.id} />;
        })}
      </main>
      <Footer />
    </>
  );
}
