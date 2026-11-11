import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { theme } from "../theme";
import { ClosingScene } from "./ClosingScene";
import { ComplianceScene } from "./ComplianceScene";
import { DisasterScene } from "./DisasterScene";
import { ImpactScene } from "./ImpactScene";
import { OpenerScene } from "./OpenerScene";
import { ProblemScene } from "./ProblemScene";
import { SolutionScene } from "./SolutionScene";
import { TitleScene } from "./TitleScene";
import { LONG_TIMING, SHORT_TIMING, type SceneTiming } from "./timeline";

const lightScene = {
  backgroundColor: theme.canvas,
  justifyContent: "center",
  alignItems: "center",
} as const;

/**
 * `TransitionSeries` inspects its children by component type, so transitions
 * must be created inline rather than wrapped in a custom component.
 */
const gap = (timing: SceneTiming & { readonly transitionAfter: number }) => (
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: timing.transitionAfter })}
  />
);

/** 30-second cut, sized for a slide deck where attention is short. */
export const SevironShort: React.FC = () => {
  const t = SHORT_TIMING;

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence name="Logo" durationInFrames={t.opener.duration}>
        <OpenerScene
          tagline="Air quality risk intelligence"
          style={{ ...lightScene }}
        />
      </TransitionSeries.Sequence>
      {gap(t.opener)}

      <TransitionSeries.Sequence
        name="Title"
        durationInFrames={t.title.duration}
        style={{
          translate: "1px 0px"
        }}
      >
        <TitleScene
          eyebrow="For industrial operations"
          headline="Clean air is a licence to operate."
          subline="Seviron shields your company from air pollution sanctions — and shields your people from the air they breathe."
          style={{ ...lightScene, alignItems: "flex-start" }}
        />
      </TransitionSeries.Sequence>
      {gap(t.title)}

      <TransitionSeries.Sequence
        name="Problem"
        durationInFrames={t.problem.duration}
      >
        <ProblemScene
          eyebrow="The risk today"
          headline="Breaching the limit means fines, shutdowns, and exposed workers."
          style={lightScene}
        />
      </TransitionSeries.Sequence>
      {gap(t.problem)}

      <TransitionSeries.Sequence
        name="Plume"
        durationInFrames={t.disaster.duration}
      >
        <DisasterScene
          eyebrow="Natural disaster scenario"
          headline="Anak Krakatau erupts. Where does the plume go, and which site is hit first?"
          travelSeconds={7}
          style={lightScene}
        />
      </TransitionSeries.Sequence>
      {gap(t.disaster)}

      <TransitionSeries.Sequence
        name="Solution"
        durationInFrames={t.solution.duration}
      >
        <SolutionScene
          eyebrow="How Seviron works"
          headline="From sensor reading to a decision you can defend."
          style={lightScene}
        />
      </TransitionSeries.Sequence>
      {gap(t.solution)}

      <TransitionSeries.Sequence
        name="Closing"
        durationInFrames={t.closing.duration}
      >
        <ClosingScene
          headline="Compliant before the notice. Ready before the plume."
          tagline="Seviron — air quality risk intelligence for industrial operations."
          style={{ ...lightScene, backgroundColor: theme.midnight }}
        />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

/** 90-second cut for the company website: adds compliance and outcomes. */
export const SevironFull: React.FC = () => {
  const t = LONG_TIMING;

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence name="Logo" durationInFrames={t.opener.duration}>
        <OpenerScene
          tagline="Air quality risk intelligence"
          style={{ ...lightScene }}
        />
      </TransitionSeries.Sequence>
      {gap(t.opener)}

      <TransitionSeries.Sequence name="Title" durationInFrames={t.title.duration}>
        <TitleScene
          eyebrow="For industrial operations in Indonesia"
          headline="Clean air is a licence to operate."
          subline="Seviron shields your company from air pollution sanctions — and shields your people from the air they breathe."
          style={{ ...lightScene, alignItems: "flex-start" }}
        />
      </TransitionSeries.Sequence>
      {gap(t.title)}

      <TransitionSeries.Sequence
        name="Problem"
        durationInFrames={t.problem.duration}
      >
        <ProblemScene
          eyebrow="The risk today"
          headline="Breaching the limit means fines, shutdowns, and exposed workers."
          style={lightScene}
        />
      </TransitionSeries.Sequence>
      {gap(t.problem)}

      <TransitionSeries.Sequence
        name="Plume"
        durationInFrames={t.disaster.duration}
      >
        <DisasterScene
          eyebrow="Natural disaster scenario"
          headline="Anak Krakatau erupts. Where does the plume go, and which site is hit first?"
          travelSeconds={15}
          style={lightScene}
        />
      </TransitionSeries.Sequence>
      {gap(t.disaster)}

      <TransitionSeries.Sequence
        name="Solution"
        durationInFrames={t.solution.duration}
      >
        <SolutionScene
          eyebrow="How Seviron works"
          headline="From sensor reading to a decision you can defend."
          style={lightScene}
        />
      </TransitionSeries.Sequence>
      {gap(t.solution)}

      <TransitionSeries.Sequence
        name="Compliance"
        durationInFrames={t.compliance.duration}
      >
        <ComplianceScene
          eyebrow="Evidence, not assurances"
          headline="Every alert becomes an audit trail regulators accept."
          footnote="Exportable for GR 22/2021 reporting, occupational health records, and ESG disclosure."
          style={lightScene}
        />
      </TransitionSeries.Sequence>
      {gap(t.compliance)}

      <TransitionSeries.Sequence
        name="Impact"
        durationInFrames={t.impact.duration}
      >
        <ImpactScene
          eyebrow="What changes"
          headline="You stop reacting to air quality. You start planning around it."
          style={{ ...lightScene, backgroundColor: theme.midnight }}
        />
      </TransitionSeries.Sequence>
      {gap(t.impact)}

      <TransitionSeries.Sequence
        name="Closing"
        durationInFrames={t.closing.duration}
      >
        <ClosingScene
          headline="Compliant before the notice. Ready before the plume."
          tagline="Seviron — air quality risk intelligence for industrial operations."
          style={{ ...lightScene, backgroundColor: theme.midnight }}
        />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
