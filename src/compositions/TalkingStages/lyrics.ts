import beatData from "./beats.json";

/**
 * Lyric timing for the hook (song 0:18–0:57, trimmed to public/talking-stages/hook.mp3).
 *
 * Times are in SECONDS from the start of the clip. They were estimated from the
 * song's phrase structure (136 BPM) and the vocal pauses, so nudge the times
 * in TIMELINE if a line lands early or late — everything else follows.
 */
export const HOOK_SECONDS = 39;

const LINES = [
  "If I go through one more talking stage",
  "I think I might die",
  "I think I might, I think I might die",
  "If I go through one more talking stage",
  "I think I might die",
  "So tell me that you're the one",
] as const;

// 2 bars at 136 BPM.
const PHRASE = (8 * 60) / beatData.bpm;
const B0 = beatData.beats[0];

/**
 * [line index, start time in seconds]. Each cue lasts until the next one starts.
 * First half: one line per 2-bar phrase. Second half (from ~21.7 s): the
 * "So tell me that you're the one" part, started at each detected vocal phrase.
 */
const TIMELINE: [number, number][] = [
  [0, B0],
  [1, B0 + PHRASE],
  [2, B0 + 2 * PHRASE],
  [3, B0 + 3 * PHRASE],
  [4, B0 + 4 * PHRASE],
  [5, B0 + 5 * PHRASE],
  [5, 21.7],
  [5, 25.45],
  [5, 28.0],
  [5, 31.2],
  [5, 34.95],
];

export type Cue = { text: string; start: number; end: number };

export const CUES: Cue[] = TIMELINE.map(([line, start], i) => ({
  text: LINES[line],
  start,
  end: i + 1 < TIMELINE.length ? TIMELINE[i + 1][1] : HOOK_SECONDS,
}));

export const BEATS: number[] = beatData.beats;

/** Words that get the "dramatic" treatment (shake, red, flash). */
export const HOT_WORDS = new Set(["die", "one"]);

export const getCue = (t: number) => {
  const index = CUES.findIndex((c) => t >= c.start && t < c.end);
  if (index === -1) return null;
  const cue = CUES[index];
  const words = cue.text.split(" ");
  // Words are revealed across the first 70% of the phrase.
  const revealSpan = (cue.end - cue.start) * 0.7;
  const wordTimes = words.map((_, i) => cue.start + (i / words.length) * revealSpan);
  const wordIndex = wordTimes.filter((w) => t >= w).length - 1;
  return {
    index,
    cue,
    words,
    wordTimes,
    wordIndex,
    /** Seconds since the line started. */
    elapsed: t - cue.start,
    /** 0–1 through the line. */
    progress: (t - cue.start) / (cue.end - cue.start),
    /** Characters to show when typing the line out (on phone screens). */
    typedChars: Math.min(cue.text.length, Math.floor(((t - cue.start) / revealSpan) * cue.text.length)),
  };
};

/** 1 on a beat, decaying to 0 over `decay` seconds. */
export const beatPulse = (t: number, decay = 0.25): number => {
  let last = -Infinity;
  for (const b of BEATS) {
    if (b <= t) last = b;
    else break;
  }
  const since = t - last;
  return since < 0 || since > decay ? 0 : 1 - since / decay;
};
