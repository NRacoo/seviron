import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme";
import { Eyebrow, Panel } from "./Brand";

const Step: React.FC<{
  readonly index: string;
  readonly title: string;
  readonly body: string;
  readonly delay: number;
}> = ({ index, title, body, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Panel
      style={{
        flex: 1,
        padding: 40,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        opacity: interpolate(frame, [delay, delay + 0.5 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(
          frame,
          [delay, delay + 0.8 * fps],
          ["0px 34px", "0px 0px"],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          },
        ),
      }}
    >
      <span
        style={{
          fontFamily: theme.mono,
          fontSize: 26,
          fontWeight: 600,
          color: theme.royal,
        }}
      >
        {index}
      </span>
      <h3
        style={{
          margin: 0,
          fontFamily: theme.font,
          fontSize: 42,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: theme.ink,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: 0,
          fontFamily: theme.font,
          fontSize: 27,
          lineHeight: 1.45,
          color: theme.ink2,
        }}
      >
        {body}
      </p>
    </Panel>
  );
};

const SolutionSceneInner: React.FC<{
  readonly eyebrow: string;
  readonly headline: string;
}> = ({ eyebrow, headline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 56,
          padding: "0 110px",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <Eyebrow tone={theme.royal}>{eyebrow}</Eyebrow>
          <h2
            style={{
              margin: 0,
              fontFamily: theme.font,
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: theme.ink,
              maxWidth: 1400,
            }}
          >
            {headline}
          </h2>
        </div>

        <div style={{ display: "flex", gap: 28 }}>
          <Step
            index="01"
            title="Monitor"
            body="Site sensors, national weather data and satellite feeds merge into one air quality baseline."
            delay={0.6 * fps}
          />
          <Step
            index="02"
            title="Forecast"
            body="Dispersion models project the pollution index per site up to 24 hours ahead."
            delay={0.85 * fps}
          />
          <Step
            index="03"
            title="Decide"
            body="A breached threshold triggers the work order: respirators, shift rotation, or stop work."
            delay={1.1 * fps}
          />
          <Step
            index="04"
            title="Prove"
            body="Every decision is recorded as an audit trail for regulators and ESG reporting."
            delay={1.35 * fps}
          />
        </div>
      </div>
    </>
  );
};

export const SolutionScene = Interactive.create({
  Component: SolutionSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
    eyebrow: { type: "string", default: "", description: "Eyebrow" },
    headline: { type: "string", default: "", description: "Headline" },
  },
});
