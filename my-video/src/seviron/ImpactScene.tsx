import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme";
import { Eyebrow } from "./Brand";

const Stat: React.FC<{
  readonly value: number;
  readonly decimals: number;
  readonly prefix: string;
  readonly suffix: string;
  readonly caption: string;
  readonly delay: number;
}> = ({ value, decimals, prefix, suffix, caption, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = interpolate(frame, [delay, delay + 0.6 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const counted = interpolate(
    frame,
    [delay + 0.15 * fps, delay + 1.5 * fps],
    [0, value],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        paddingLeft: 36,
        borderLeft: `2px solid rgba(255,255,255,0.16)`,
        opacity: appear,
        translate: `0px ${(1 - appear) * 28}px`,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span
          style={{
            fontFamily: theme.mono,
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "#ffffff",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {`${prefix}${counted.toFixed(decimals)}`}
        </span>
        {/* Kept out of the tabular-nums run so the unit is not digit-width. */}
        <span
          style={{
            fontFamily: theme.font,
            fontSize: 52,
            fontWeight: 600,
            color: "rgba(255,255,255,0.82)",
          }}
        >
          {suffix}
        </span>
      </div>
      <span
        style={{
          fontFamily: theme.font,
          fontSize: 30,
          lineHeight: 1.4,
          color: "rgba(255,255,255,0.68)",
        }}
      >
        {caption}
      </span>
    </div>
  );
};

const ImpactSceneInner: React.FC<{
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
          gap: 72,
          padding: "0 110px",
          width: "100%",
          opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <Eyebrow tone="rgba(255,255,255,0.55)">{eyebrow}</Eyebrow>
          <h2
            style={{
              margin: 0,
              fontFamily: theme.font,
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              maxWidth: 1400,
            }}
          >
            {headline}
          </h2>
        </div>

        <div style={{ display: "flex", gap: 48 }}>
          <Stat
            value={9}
            decimals={0}
            prefix=""
            suffix="hours"
            caption="Median warning time before hazardous air reaches a site."
            delay={0.8 * fps}
          />
          <Stat
            value={100}
            decimals={0}
            prefix=""
            suffix="%"
            caption="Of threshold breaches logged with a signed, auditable response."
            delay={1.15 * fps}
          />
          <Stat
            value={1240}
            decimals={0}
            prefix=""
            suffix=""
            caption="Field workers covered by automatic exposure protection."
            delay={1.5 * fps}
          />
        </div>
      </div>
    </>
  );
};

export const ImpactScene = Interactive.create({
  Component: ImpactSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
    eyebrow: { type: "string", default: "", description: "Eyebrow" },
    headline: { type: "string", default: "", description: "Headline" },
  },
});
