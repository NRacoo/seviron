import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "../theme";
import { Eyebrow, Panel } from "./Brand";
import {
  DEFAULT_TRAVEL_SECONDS,
  PlumeMap,
  plumeHours,
  SITES,
} from "./PlumeMap";

const Clock: React.FC<{ readonly travelSeconds: number }> = ({
  travelSeconds,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const hours = plumeHours(frame, fps, travelSeconds);

  return (
    <span
      style={{
        fontFamily: theme.mono,
        fontSize: 40,
        fontWeight: 600,
        color: theme.royal,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {`T+${hours.toFixed(1)} h`}
    </span>
  );
};

const ArrivalRow: React.FC<{
  readonly name: string;
  readonly etaHours: number;
  readonly pm25: number;
  readonly tone: string;
  readonly travelSeconds: number;
}> = ({ name, etaHours, pm25, tone, travelSeconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const hit = plumeHours(frame, fps, travelSeconds) >= etaHours;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "20px 0",
        borderBottom: `1px solid ${theme.line}`,
        opacity: hit ? 1 : 0.38,
      }}
    >
      <span
        style={{
          width: 6,
          height: 40,
          borderRadius: 3,
          background: hit ? tone : theme.lineStrong,
        }}
      />
      <span
        style={{
          flex: 1,
          fontFamily: theme.font,
          fontSize: 30,
          fontWeight: 600,
          color: theme.ink,
        }}
      >
        {name}
      </span>
      <span
        style={{
          fontFamily: theme.mono,
          fontSize: 28,
          color: theme.ink3,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {`+${etaHours}h`}
      </span>
      <span
        style={{
          fontFamily: theme.mono,
          fontSize: 30,
          fontWeight: 600,
          color: hit ? tone : theme.ink3,
          width: 190,
          textAlign: "right",
          whiteSpace: "nowrap",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {hit ? `${pm25} µg/m³` : "—"}
      </span>
    </div>
  );
};

const DisasterSceneInner: React.FC<{
  readonly eyebrow: string;
  readonly headline: string;
  readonly travelSeconds: number;
}> = ({ eyebrow, headline, travelSeconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 36,
          padding: "0 110px",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 40,
            opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Eyebrow tone={theme.royal}>{eyebrow}</Eyebrow>
            <h2
              style={{
                margin: 0,
                fontFamily: theme.font,
                fontSize: 68,
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: theme.ink,
                maxWidth: 1080,
              }}
            >
              {headline}
            </h2>
          </div>
          <Clock travelSeconds={travelSeconds} />
        </div>

        <div style={{ display: "flex", gap: 32, alignItems: "stretch" }}>
          <Panel
            style={{
              flex: 1.55,
              padding: 28,
              overflow: "hidden",
              opacity: interpolate(frame, [0.3 * fps, 0.9 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <PlumeMap travelSeconds={travelSeconds} />
          </Panel>

          <Panel
            style={{
              flex: 1,
              padding: "28px 36px",
              display: "flex",
              flexDirection: "column",
              opacity: interpolate(frame, [0.5 * fps, 1.1 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              translate: interpolate(
                frame,
                [0.5 * fps, 1.2 * fps],
                ["30px 0px", "0px 0px"],
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
                paddingBottom: 18,
              }}
            >
              Forecast plume arrival per site
            </span>

            {SITES.map((s) => (
              <ArrivalRow
                key={s.name}
                name={s.name}
                etaHours={s.etaHours}
                pm25={s.pm25}
                tone={s.tone}
                travelSeconds={travelSeconds}
              />
            ))}

            <p
              style={{
                margin: 0,
                paddingTop: 26,
                fontFamily: theme.font,
                fontSize: 25,
                lineHeight: 1.45,
                color: theme.ink2,
              }}
            >
              Shutdown and evacuation orders go out before the plume arrives —
              not after.
            </p>
          </Panel>
        </div>
      </div>
    </>
  );
};

export const DisasterScene = Interactive.create({
  Component: DisasterSceneInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
    eyebrow: { type: "string", default: "", description: "Eyebrow" },
    headline: { type: "string", default: "", description: "Headline" },
    travelSeconds: {
      type: "number",
      default: DEFAULT_TRAVEL_SECONDS,
      description: "Plume travel time (s)",
      hiddenFromList: false,
    },
  },
});
