/**
 * Scene timing lives here so `Root.tsx` and the timeline component can never
 * drift apart: the composition duration is derived, not hand-counted.
 */
export type SceneTiming = {
  /** Length of the scene itself, in frames. */
  readonly duration: number;
  /** Length of the transition that follows it. Omit on the last scene. */
  readonly transitionAfter?: number;
};

export const timelineDuration = (scenes: readonly SceneTiming[]): number =>
  scenes.reduce((acc, s) => acc + s.duration - (s.transitionAfter ?? 0), 0);

const s = (seconds: number) => Math.round(seconds * 30);

/** 30 s cut for slide decks: logo, stakes, plume, how it works, close. */
export const SHORT_TIMING = {
  opener: { duration: s(3), transitionAfter: 12 },
  title: { duration: s(5), transitionAfter: 12 },
  problem: { duration: s(6), transitionAfter: 12 },
  disaster: { duration: s(9), transitionAfter: 12 },
  solution: { duration: s(4.5), transitionAfter: 12 },
  closing: { duration: s(4.5) },
} as const satisfies Record<string, SceneTiming>;

/** 90 s cut for the company website: adds compliance + outcome chapters. */
export const LONG_TIMING = {
  opener: { duration: s(4), transitionAfter: 15 },
  title: { duration: s(9), transitionAfter: 15 },
  problem: { duration: s(13), transitionAfter: 15 },
  disaster: { duration: s(20), transitionAfter: 15 },
  solution: { duration: s(15), transitionAfter: 15 },
  compliance: { duration: s(12), transitionAfter: 15 },
  impact: { duration: s(12), transitionAfter: 15 },
  closing: { duration: s(8.5) },
} as const satisfies Record<string, SceneTiming>;

export const SHORT_DURATION = timelineDuration(Object.values(SHORT_TIMING));
export const LONG_DURATION = timelineDuration(Object.values(LONG_TIMING));
