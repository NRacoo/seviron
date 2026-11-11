import raw from "@/content/site.json";

export type ColorKey =
  | "navy" | "blue" | "skyBlue" | "lime" | "orange"
  | "gain" | "loss" | "text" | "muted" | "panel";

export type Stat = { value: number; decimals: number; unit?: string; label: string };

export type HeroSection = {
  id: "hero"; pin: boolean; scrollLength: string;
  content: { kicker: string; headline: string; subhead: string; scrollHint: boolean };
};

export type StoryBeat = {
  kicker?: string;
  text: string;
  stat?: Stat;
  compare?: { value: number; unit: string; label: string };
  chips?: string[];
  bigWord?: string;
};

export type StorySection = {
  id: "story"; pin: boolean; scrollLength: string;
  beats: StoryBeat[]; sources: string[];
};

export type GapSection = {
  id: "gap"; pin: boolean;
  content: {
    headline: string; subhead: string; body: string;
    sensors: { brand: string; value: string }[];
  };
};

export type ProductSection = {
  id: "product"; pin: boolean; scrollLength: string;
  content: { kicker: string; headline: string; pillars: { title: string; text: string }[] };
};

export type Parameter = {
  key: string; label: string; unit: string;
  now: number; peak: number; peakAt: string; limit: number;
  status: "above" | "watch" | "within";
};

export type DemoStep = {
  id: string; tab: string; caption: string;
  decision?: { title: string; actions: string[] };
  log?: { time: string; owner: string; action: string }[];
  report?: { label: string; value: string }[];
};

export type DemoSection = {
  id: "demo"; pin: boolean; scrollLength: string;
  content: { kicker: string; headline: string; badge: string; openFull: { label: string; href: string } };
  site: { name: string; sensorsReporting: string; source: string; updated: string };
  parameters: Parameter[];
  statusColors: Record<Parameter["status"], ColorKey>;
  forecastSeries: { parameter: string; observedEnd: number; forecastPeak: number; peakHour: number; limit: number };
  steps: DemoStep[];
  interaction: string;
};

export type OutcomeSection = {
  id: "outcome"; pin: boolean;
  content: {
    headline: string;
    without: { title: string; items: string[]; color: ColorKey };
    with: { title: string; items: string[]; color: ColorKey };
  };
};

export type SolutionsSection = {
  id: "solutions"; pin: boolean;
  content: {
    headline: string; showPricing: boolean;
    items: { title: string; text: string; price: string; primary: boolean; label?: string }[];
  };
};

export type WhySection = {
  id: "why"; pin: boolean;
  content: { headline: string; rows: { capability: string; perisai: boolean; others: string }[] };
};

export type AboutSection = {
  id: "about"; pin: boolean;
  content: {
    headline: string; mission: string;
    team: { name: string; role: string }[];
    advisors: { name: string; role: string }[];
    partners: string;
  };
};

export type ContactSection = {
  id: "contact"; pin: boolean; scrollLength: string;
  content: {
    stat: string; headline: string; body: string; tagline: string;
    form: { fields: string[]; submit: string; action: string };
  };
};

export type Section =
  | HeroSection | StorySection | GapSection | ProductSection | DemoSection
  | OutcomeSection | SolutionsSection | WhySection | AboutSection | ContactSection;

export type Site = Omit<typeof raw, "sections"> & { sections: Section[] };

export const site = raw as unknown as Site;

export function section<T extends Section>(id: T["id"]): T {
  const found = site.sections.find((s) => s.id === id);
  if (!found) throw new Error(`Section "${id}" missing from content/site.json`);
  return found as T;
}

export const colors = site.design.colors;

export function cssVar(key: ColorKey) {
  return `var(--c-${key})`;
}
