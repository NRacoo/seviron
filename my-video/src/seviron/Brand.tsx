import { CanvasImage, staticFile } from "remotion";
import { theme } from "../theme";

export const Wordmark: React.FC<{
  readonly size?: number;
  readonly tone?: "dark" | "light";
}> = ({ size = 44, tone = "dark" }) => {
  // The logo asset is a white glyph, so on light backgrounds it needs a
  // brand-coloured tile behind it to stay visible.
  const light = tone === "light";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.4 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.24,
          background: light ? "transparent" : theme.royal,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CanvasImage
          src={staticFile("SEV.png")}
          style={{
            width: light ? size : size * 0.74,
            height: light ? size : size * 0.74,
            objectFit: "contain",
          }}
          durationInFrames={123}
        />
      </div>
      <span
        style={{
          fontFamily: theme.font,
          fontSize: size * 0.62,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: light ? "#ffffff" : theme.ink,
        }}
      >
        Seviron
      </span>
    </div>
  );
};

export const Eyebrow: React.FC<{
  readonly children: React.ReactNode;
  readonly tone?: string;
}> = ({ children, tone = theme.ink3 }) => (
  <span
    style={{
      fontFamily: theme.font,
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: tone,
    }}
  >
    {children}
  </span>
);

export const Panel: React.FC<{
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ children, style }) => (
  <div
    style={{
      background: theme.surface,
      border: `1px solid ${theme.line}`,
      borderRadius: 14,
      boxShadow: "0 1px 2px rgba(11,18,33,0.04)",
      ...style,
    }}
  >
    {children}
  </div>
);
