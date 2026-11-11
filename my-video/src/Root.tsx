import { Composition, Folder } from "remotion";
import { theme } from "./theme";
import { ClosingScene } from "./seviron/ClosingScene";
import { ComplianceScene } from "./seviron/ComplianceScene";
import { DisasterScene } from "./seviron/DisasterScene";
import { ImpactScene } from "./seviron/ImpactScene";
import { OpenerScene } from "./seviron/OpenerScene";
import { ProblemScene } from "./seviron/ProblemScene";
import { SevironFull, SevironShort } from "./seviron/SevironMvp";
import { SolutionScene } from "./seviron/SolutionScene";
import { TitleScene } from "./seviron/TitleScene";
import { LONG_DURATION, SHORT_DURATION } from "./seviron/timeline";

const video = { fps: 30, width: 1920, height: 1080 } as const;

const lightScene = {
  backgroundColor: theme.canvas,
  justifyContent: "center",
  alignItems: "center",
} as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 30 s deck cut. */}
      <Composition
        id="SevironShort"
        component={SevironShort}
        durationInFrames={SHORT_DURATION}
        {...video}
      />

      {/* 1:30 website cut. */}
      <Composition
        id="SevironFull"
        component={SevironFull}
        durationInFrames={LONG_DURATION}
        {...video}
      />

      <Folder name="Scenes">
        <Composition
          id="Logo"
          component={OpenerScene}
          durationInFrames={120}
          {...video}
          defaultProps={{
            tagline: "Air quality risk intelligence",
            style: { ...lightScene },
          }}
        />
        <Composition
          id="Title"
          component={TitleScene}
          durationInFrames={270}
          {...video}
          defaultProps={{
            eyebrow: "For industrial operations in Indonesia",
            headline: "Clean air is a licence to operate.",
            subline:
              "Seviron shields your company from air pollution sanctions — and shields your people from the air they breathe.",
            style: { ...lightScene, alignItems: "flex-start" },
          }}
        />
        <Composition
          id="Problem"
          component={ProblemScene}
          durationInFrames={390}
          {...video}
          defaultProps={{
            eyebrow: "The risk today",
            headline:
              "Breaching the limit means fines, shutdowns, and exposed workers.",
            style: { ...lightScene },
          }}
        />
        <Composition
          id="Plume"
          component={DisasterScene}
          durationInFrames={600}
          {...video}
          defaultProps={{
            eyebrow: "Natural disaster scenario",
            headline:
              "Anak Krakatau erupts. Where does the plume go, and which site is hit first?",
            travelSeconds: 15,
            style: { ...lightScene },
          }}
        />
        <Composition
          id="Solution"
          component={SolutionScene}
          durationInFrames={450}
          {...video}
          defaultProps={{
            eyebrow: "How Seviron works",
            headline: "From sensor reading to a decision you can defend.",
            style: { ...lightScene },
          }}
        />
        <Composition
          id="Compliance"
          component={ComplianceScene}
          durationInFrames={360}
          {...video}
          defaultProps={{
            eyebrow: "Evidence, not assurances",
            headline: "Every alert becomes an audit trail regulators accept.",
            footnote:
              "Exportable for GR 22/2021 reporting, occupational health records, and ESG disclosure.",
            style: { ...lightScene },
          }}
        />
        <Composition
          id="Impact"
          component={ImpactScene}
          durationInFrames={360}
          {...video}
          defaultProps={{
            eyebrow: "What changes",
            headline:
              "You stop reacting to air quality. You start planning around it.",
            style: { ...lightScene, backgroundColor: theme.midnight },
          }}
        />
        <Composition
          id="Closing"
          component={ClosingScene}
          durationInFrames={255}
          {...video}
          defaultProps={{
            headline: "Compliant before the notice. Ready before the plume.",
            tagline:
              "Seviron — air quality risk intelligence for industrial operations.",
            style: { ...lightScene, backgroundColor: theme.midnight },
          }}
        />
      </Folder>
    </>
  );
};
