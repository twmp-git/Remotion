export type PhoneProps = {
  caseColor: string;
  /** Full text of the current lyric line. */
  text: string;
  /** How many characters of `text` are typed so far. */
  typedChars: number;
  /** Seconds since the current line started (for screen flashes). */
  sinceCue: number;
  /** Index of the key currently pressed by the thumb, if any. */
  activeKey: number | null;
  /** Words of the line and how many are revealed (for chat-bubble phones). */
  words: string[];
  wordIndex: number;
  /** Earlier lines, oldest first (for chat-style screens). */
  history: string[];
  /** Index of the current line in the song. */
  cueIndex: number;
};
