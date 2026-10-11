import { sec } from "../../config/video";

/**
 * Scene lengths in SECONDS. Edit these to retime the video — the total
 * composition duration, transition points and synced sound effects all
 * derive from these numbers.
 */
export const SHOWCASE_TIMING = {
  intro: 3.6,
  shapes: 4.2,
  specs: 4.2,
  outro: 3.8,
  /** Length of each transition between scenes (scenes overlap by this much). */
  transitionDuration: 0.7,
} as const;

export const getShowcaseFrames = (fps: number) => {
  const intro = sec(SHOWCASE_TIMING.intro, fps);
  const shapes = sec(SHOWCASE_TIMING.shapes, fps);
  const specs = sec(SHOWCASE_TIMING.specs, fps);
  const outro = sec(SHOWCASE_TIMING.outro, fps);
  const transition = sec(SHOWCASE_TIMING.transitionDuration, fps);

  // Transitions overlap adjacent scenes, so each one shortens the timeline.
  const starts = {
    intro: 0,
    shapes: intro - transition,
    specs: intro + shapes - 2 * transition,
    outro: intro + shapes + specs - 3 * transition,
  };

  return {
    intro,
    shapes,
    specs,
    outro,
    transitionFrames: transition,
    starts,
    total: intro + shapes + specs + outro - 3 * transition,
  };
};
