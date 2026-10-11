import aligned from "./aligned.json";

/**
 * Word timings for the artist's verse, produced by forced alignment
 * (Meta MMS multilingual aligner) of the supplied Chichewa lyrics against the song.
 *
 * Times in aligned.json are SONG seconds. VERSE_START is where the clip begins in the
 * song; everything in the video is relative to that.
 */
export const VERSE_START = 80;

export type Word = { word: string; line: number; start: number; end: number; conf: number };

export const LINES: string[] = aligned.lines;
export const WORDS: Word[] = (aligned.words as Word[]).map((w) => ({
  ...w,
  start: w.start - VERSE_START,
  end: w.end - VERSE_START,
}));

/** First/last word time of each lyric line (clip seconds). */
export const LINE_TIMES = LINES.map((_, i) => {
  const ws = WORDS.filter((w) => w.line === i);
  return { start: ws[0]?.start ?? 0, end: ws[ws.length - 1]?.end ?? 0 };
});

/** Clip length: last word + a short tail for the final hit to ring out. */
export const VERSE_SECONDS = Math.ceil((LINE_TIMES[LINE_TIMES.length - 1].end + 1.6) * 10) / 10;

export const lineStart = (i: number) => LINE_TIMES[i].start;
export const lineEnd = (i: number) => LINE_TIMES[i].end;
