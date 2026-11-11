export type IconName =
  | "map"
  | "sensors"
  | "forecast"
  | "decisions"
  | "actions"
  | "esg"
  | "arrow-up"
  | "arrow-down"
  | "check"
  | "alert"
  | "clock"
  | "download"
  | "chevron";

const paths: Record<IconName, React.ReactNode> = {
  map: (
    <>
      <path d="M9 4.2 3.5 6.4v13.4L9 17.6l6 2.2 5.5-2.2V4.2L15 6.4z" />
      <path d="M9 4.2v13.4M15 6.4v13.4" />
    </>
  ),
  sensors: (
    <>
      <circle cx="12" cy="12" r="2.2" />
      <path d="M8.2 8.2a5.4 5.4 0 0 0 0 7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6" />
      <path d="M5.4 5.4a9.4 9.4 0 0 0 0 13.2M18.6 5.4a9.4 9.4 0 0 1 0 13.2" />
    </>
  ),
  forecast: (
    <>
      <path d="M3 17.5 8.5 11l4 3.6L21 6" />
      <path d="M15.6 6H21v5.4" />
    </>
  ),
  decisions: (
    <>
      <path d="M12 3v5M12 16v5M5.5 12H3M21 12h-2.5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M6.3 6.3 8 8M18 18l-1.7-1.7" />
    </>
  ),
  actions: (
    <>
      <path d="M13 3 5 13.5h5.4L10 21l8-10.5h-5.4z" />
    </>
  ),
  esg: (
    <>
      <rect x="3.5" y="4" width="17" height="16" rx="2" />
      <path d="M8 15v-3M12 15V9M16 15v-5" />
    </>
  ),
  "arrow-up": <path d="M12 19V6M6.5 11 12 5.5 17.5 11" />,
  "arrow-down": <path d="M12 5v13M6.5 13 12 18.5 17.5 13" />,
  check: <path d="M5 12.8 9.6 17.4 19 7.6" />,
  alert: (
    <>
      <path d="M12 4.5 21 19.5H3z" />
      <path d="M12 10v4.2M12 17.2v.3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.2V12l3.2 2" />
    </>
  ),
  download: <path d="M12 4v11M7.4 10.6 12 15.2l4.6-4.6M4.5 19.5h15" />,
  chevron: <path d="M9.5 6 15.5 12l-6 6" />,
};

export function Icon({
  name,
  size = 16,
  strokeWidth = 1.5,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
