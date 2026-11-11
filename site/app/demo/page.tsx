import type { Metadata } from "next";
import { site } from "@/lib/content";
import { DemoFull } from "./DemoFull";

export const metadata: Metadata = {
  title: `${site.meta.product} demo | ${site.meta.company}`,
  description: site.seo.description,
};

export default function DemoPage() {
  return <DemoFull />;
}
