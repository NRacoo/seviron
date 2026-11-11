import {
  CanvasImage,
  Easing,
  Interactive,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme";

/**
 * Logo sting: the brand colour wipes away to reveal the mark, then the
 * wordmark types out beside it.
 */
const OpenerSceneInner: React.FC<{ readonly tagline: string }> = ({
  tagline,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const wipe = interpolate(frame, [0.35 * fps, 1.15 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.76, 0, 0.24, 1),
  });

  const markPop = spring({
    frame: frame - 0.1 * fps,
    fps,
    config: { damping: 14, mass: 0.7 },
  });

  const wordReveal = interpolate(frame, [1 * fps, 1.9 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const taglineIn = interpolate(frame, [1.5 * fps, 2.2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const mark = 150;

  return (
    <>
      {/* Brand-colour panel that slides off to the right. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: theme.royal,
          translate: `${wipe * width}px 0px`,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 38,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <div
            style={{
              width: mark,
              height: mark,
              borderRadius: mark * 0.24,
              background: theme.royal,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scale: markPop,
            }}
          >
            <CanvasImage
              src={staticFile("SEV.png")}
              style={{
                width: mark * 0.72,
                height: mark * 0.72,
                objectFit: "contain",
              }}
            />
          </div>

          <div
            style={{
              overflow: "hidden",
              width: wordReveal * 520,
            }}
          >
            <span
              style={{
                display: "block",
                fontFamily: theme.font,
                fontSize: 104,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: theme.ink,
                whiteSpace: "nowrap",
              }}
            >
              Seviron
            </span>
          </div>
        </div>

        <span
          style={{
            fontFamily: theme.font,
            fontSize: 30,
            fontWeight: 500,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: theme.ink3,
            opacity: taglineIn,
          }}
        >
          {tagline}
        </span>
      </div>
    </>
  );
};

export const OpenerScene = Interactive.create({
  Component: OpenerSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
    tagline: { type: "string", default: "", description: "Tagline" },
  },
});
