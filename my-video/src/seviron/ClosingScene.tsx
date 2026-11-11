import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme";
import { Wordmark } from "./Brand";

const ClosingSceneInner: React.FC<{
  readonly headline: string;
  readonly tagline: string;
}> = ({ headline, tagline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 44,
          padding: "0 120px",
          textAlign: "center",
          opacity: interpolate(frame, [0, 0.7 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          scale: interpolate(frame, [0, 1.6 * fps], [0.96, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            output: "perceptual-scale",
          }),
        }}
      >
        <Wordmark size={80} tone="light" />

        <h2
          style={{
            margin: 0,
            fontFamily: theme.font,
            fontSize: 86,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "#ffffff",
            maxWidth: 1420,
          }}
        >
          {headline}
        </h2>

        <p
          style={{
            margin: 0,
            fontFamily: theme.font,
            fontSize: 40,
            lineHeight: 1.45,
            color: "rgba(255,255,255,0.72)",
            maxWidth: 1100,
          }}
        >
          {tagline}
        </p>
      </div>
    </>
  );
};

export const ClosingScene = Interactive.create({
  Component: ClosingSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
    headline: { type: "string", default: "", description: "Headline" },
    tagline: { type: "string", default: "", description: "Tagline" },
  },
});
