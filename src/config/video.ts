/**
 * Global video settings.
 *
 * Change these values to re-target every composition that uses them.
 * All timing in this project is authored in SECONDS and converted to frames
 * with `sec()`, so changing `fps` keeps animations the same real-world speed.
 */
export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;

/** Common alternative formats, ready to pass to <Composition>. */
export const FORMATS = {
  landscape: { width: 1920, height: 1080 },
  square: { width: 1080, height: 1080 },
  vertical: { width: 1080, height: 1920 },
  landscape4k: { width: 3840, height: 2160 },
} as const;

/** Convert seconds to a whole number of frames. */
export const sec = (seconds: number, fps: number): number =>
  Math.round(seconds * fps);
