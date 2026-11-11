import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme";
import { Eyebrow, Wordmark } from "./Brand";

const Reveal: React.FC<{
  readonly children: React.ReactNode;
  readonly delay: number;
}> = ({ children, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        opacity: interpolate(frame, [delay, delay + 0.7 * fps], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        translate: interpolate(
          frame,
          [delay, delay + 0.9 * fps],
          ["0px 24px", "0px 0px"],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          },
        ),
      }}
    >
      {children}
    </div>
  );
};

const TitleSceneInner: React.FC<{
  readonly eyebrow: string;
  readonly headline: string;
  readonly subline: string;
}> = ({ eyebrow, headline, subline }) => {
  const { fps } = useVideoConfig();

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 40,
          top: 10,
          padding: "0 120px",
          maxWidth: 1500,
        }}
      >
        <Reveal delay={0}>
          <Wordmark size={64} />
        </Reveal>

        <Reveal delay={0.4 * fps}>
          <Eyebrow tone={theme.royal}>{eyebrow}</Eyebrow>
        </Reveal>

        <Reveal delay={0.7 * fps}>
          <h1
            style={{
              margin: 0,
              fontFamily: theme.font,
              fontSize: 104,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: theme.ink,
            }}
          >
            {headline}
          </h1>
        </Reveal>

        <Reveal delay={1.1 * fps}>
          <p
            style={{
              margin: 0,
              fontFamily: theme.font,
              fontSize: 46,
              lineHeight: 1.45,
              color: theme.ink2,
              maxWidth: 1180,
            }}
          >
            {subline}
          </p>
        </Reveal>
      </div>
    </>
  );
};

export const TitleScene = Interactive.create({
  Component: TitleSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
    eyebrow: { type: "string", default: "", description: "Eyebrow" },
    headline: { type: "string", default: "", description: "Headline" },
    subline: { type: "string", default: "", description: "Subline" },
  },
});
