import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme";
import { Eyebrow, Panel } from "./Brand";

const Counter: React.FC<{
  readonly to: number;
  readonly delay: number;
  readonly decimals: number;
}> = ({ to, delay, decimals }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const value = interpolate(frame, [delay, delay + 1.3 * fps], [0, to], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return <>{value.toFixed(decimals)}</>;
};

const RiskCard: React.FC<{
  readonly label: string;
  readonly value: number;
  readonly decimals: number;
  readonly unit: string;
  readonly limit: string;
  readonly tone: string;
  readonly delay: number;
}> = ({ label, value, decimals, unit, limit, tone, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Panel
      style={{
        padding: 40,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        flex: 1,
        opacity: interpolate(frame, [delay, delay + 0.5 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(
          frame,
          [delay, delay + 0.8 * fps],
          ["0px 30px", "0px 0px"],
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
          fontFamily: theme.font,
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: theme.ink3,
        }}
      >
        {label}
      </span>

      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span
          style={{
            fontFamily: theme.mono,
            fontSize: 86,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: tone,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <Counter to={value} delay={delay + 0.2 * fps} decimals={decimals} />
        </span>
        <span
          style={{
            fontFamily: theme.font,
            fontSize: 30,
            fontWeight: 500,
            color: theme.ink3,
          }}
        >
          {unit}
        </span>
      </div>

      <div
        style={{
          height: 8,
          borderRadius: 4,
          background: theme.surfaceSunk,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 4,
            background: tone,
            width: interpolate(
              frame,
              [delay + 0.3 * fps, delay + 1.5 * fps],
              ["0%", "88%"],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        />
      </div>

      <span
        style={{
          fontFamily: theme.font,
          fontSize: 24,
          color: theme.ink3,
        }}
      >
        {limit}
      </span>
    </Panel>
  );
};

const ProblemSceneInner: React.FC<{
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
            gap: 24,
            opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <Eyebrow tone={theme.crit}>{eyebrow}</Eyebrow>
          <h2
            style={{
              margin: 0,
              fontFamily: theme.font,
              fontSize: 78,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: theme.ink,
              maxWidth: 1420,
            }}
          >
            {headline}
          </h2>
        </div>

        <div style={{ display: "flex", gap: 32 }}>
          <RiskCard
            label="Average shift PM2.5"
            value={78.4}
            decimals={1}
            unit="µg/m³"
            limit="Occupational limit 35 µg/m³"
            tone={theme.crit}
            delay={0.7 * fps}
          />
          <RiskCard
            label="Workers exposed"
            value={1240}
            decimals={0}
            unit="people"
            limit="Across 4 operating sites"
            tone={theme.high}
            delay={0.95 * fps}
          />
          <RiskCard
            label="Sanction exposure"
            value={12.6}
            decimals={1}
            unit="bn IDR"
            limit="GR 22/2021 · fines + shutdown"
            tone={theme.warn}
            delay={1.2 * fps}
          />
        </div>
      </div>
    </>
  );
};

export const ProblemScene = Interactive.create({
  Component: ProblemSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
    eyebrow: { type: "string", default: "", description: "Eyebrow" },
    headline: { type: "string", default: "", description: "Headline" },
  },
});
