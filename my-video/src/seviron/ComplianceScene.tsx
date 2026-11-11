import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme";
import { Eyebrow, Panel } from "./Brand";

type LogEntry = {
  readonly time: string;
  readonly action: string;
  readonly detail: string;
  readonly tone: string;
};

const LOG: readonly LogEntry[] = [
  {
    time: "06:12",
    action: "Threshold breached",
    detail: "Cilegon · PM2.5 182 µg/m³ · limit 35",
    tone: theme.crit,
  },
  {
    time: "06:12",
    action: "Crew alerted",
    detail: "248 workers · respirators mandated",
    tone: theme.high,
  },
  {
    time: "06:31",
    action: "Operations paused",
    detail: "Outdoor units 3–7 · approved by HSE lead",
    tone: theme.warn,
  },
  {
    time: "09:04",
    action: "Report filed",
    detail: "Regulator submission · signed & timestamped",
    tone: theme.ok,
  },
];

const Row: React.FC<{ readonly entry: LogEntry; readonly delay: number }> = ({
  entry,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = interpolate(frame, [delay, delay + 0.5 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 28,
        padding: "26px 0",
        borderBottom: `1px solid ${theme.line}`,
        opacity: appear,
        translate: `${(1 - appear) * 26}px 0px`,
      }}
    >
      <span
        style={{
          fontFamily: theme.mono,
          fontSize: 30,
          color: theme.ink3,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {entry.time}
      </span>
      <span
        style={{ width: 10, height: 10, borderRadius: 5, background: entry.tone }}
      />
      <span
        style={{
          width: 330,
          fontFamily: theme.font,
          fontSize: 32,
          fontWeight: 600,
          color: theme.ink,
        }}
      >
        {entry.action}
      </span>
      <span
        style={{
          flex: 1,
          fontFamily: theme.font,
          fontSize: 29,
          color: theme.ink2,
        }}
      >
        {entry.detail}
      </span>
    </div>
  );
};

const ComplianceSceneInner: React.FC<{
  readonly eyebrow: string;
  readonly headline: string;
  readonly footnote: string;
}> = ({ eyebrow, headline, footnote }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 48,
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

        <Panel style={{ padding: "16px 44px 36px" }}>
          {LOG.map((entry, i) => (
            <Row key={entry.action} entry={entry} delay={(0.8 + i * 0.5) * fps} />
          ))}
          <p
            style={{
              margin: 0,
              paddingTop: 30,
              fontFamily: theme.font,
              fontSize: 28,
              color: theme.ink2,
            }}
          >
            {footnote}
          </p>
        </Panel>
      </div>
    </>
  );
};

export const ComplianceScene = Interactive.create({
  Component: ComplianceSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
    eyebrow: { type: "string", default: "", description: "Eyebrow" },
    headline: { type: "string", default: "", description: "Headline" },
    footnote: { type: "string", default: "", description: "Footnote" },
  },
});
