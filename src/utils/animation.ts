import {
  Easing,
  interpolate,
  spring,
  type SpringConfig,
} from "remotion";

/**
 * Reusable, deterministic animation helpers.
 *
 * Every helper is a pure function of the current frame. Never use CSS
 * transitions/animations, timers or Math.random() — they do not render
 * consistently. Use `random(seed)` from "remotion" for randomness.
 */

export const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

/** Snappy "ease out expo"-like curve. Good default for entrances. */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
/** Symmetric curve for moves between two positions. */
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
/** Accelerating curve for exits. */
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);

/** Spring presets for `spring()`. */
export const SPRINGS = {
  smooth: { damping: 200 },
  snappy: { damping: 20, stiffness: 200 },
  bouncy: { damping: 9, stiffness: 120 },
} satisfies Record<string, Partial<SpringConfig>>;

/**
 * 0 → 1 progress between `start` and `start + duration` (frames), eased and clamped.
 */
export const progress = (
  frame: number,
  start: number,
  duration: number,
  easing: (t: number) => number = EASE_OUT,
): number =>
  interpolate(frame, [start, start + duration], [0, 1], { ...CLAMP, easing });

/** 0 → 1 spring starting at `delay` frames. Can overshoot with bouncy configs. */
export const springIn = (
  frame: number,
  fps: number,
  delay = 0,
  config: Partial<SpringConfig> = SPRINGS.smooth,
  durationInFrames?: number,
): number => spring({ frame: frame - delay, fps, config, durationInFrames });

/** Linear blend between two numbers. */
export const mix = (t: number, from: number, to: number): number =>
  from + (to - from) * t;

/**
 * Fade in at the start and out at the end of a clip.
 * Returns opacity 0 → 1 → 1 → 0.
 */
export const fadeInOut = (
  frame: number,
  durationInFrames: number,
  fadeFrames: number,
): number =>
  interpolate(
    frame,
    [0, fadeFrames, durationInFrames - fadeFrames, durationInFrames],
    [0, 1, 1, 0],
    CLAMP,
  );

/** Delay for the n-th item of a staggered group. */
export const stagger = (index: number, step: number, base = 0): number =>
  base + index * step;

/** Smooth looping oscillation in [-amplitude, amplitude]. `period` in frames. */
export const wave = (
  frame: number,
  period: number,
  amplitude = 1,
  phase = 0,
): number => Math.sin((frame / period) * Math.PI * 2 + phase) * amplitude;

/** Count a number up from 0 to `to` with easing (for kinetic stats). */
export const countUp = (
  frame: number,
  start: number,
  duration: number,
  to: number,
): number => Math.round(progress(frame, start, duration) * to);
