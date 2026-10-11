import beatData from "./beats.json";

/**
 * Lyric timing for the hook (song 0:18–0:57, trimmed to public/talking-stages/hook.mp3).
 *
 * Times are in SECONDS from the start of the clip. They were estimated from the
 * song's phrase structure (136 BPM, one line per 2 bars), so nudge `start`
 * values here if a line lands early or late — everything else follows.
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
const FIRST_DOWNBEAT = beatData.beats[0];

/** Which line plays in each 2-bar phrase. */
const ORDER = [0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 5];

export type Cue = { text: string; start: number; end: number };

export const CUES: Cue[] = ORDER.map((line, i) => ({
  text: LINES[line],
  start: FIRST_DOWNBEAT + i * PHRASE,
  end: Math.min(HOOK_SECONDS, FIRST_DOWNBEAT + (i + 1) * PHRASE),
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
