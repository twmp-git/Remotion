import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { staticFile } from "remotion";
import "../TalkingStages/fonts";
import { LyricsOverlay } from "./LyricsOverlay";
import { Grain } from "./parts";
import { Dawn, Listen, NightSea, type Act1Times } from "./scenes/Act1";
import { WORDS, lineEnd, lineStart } from "./timing";

export type MawaProps = { withLyrics: boolean; withAudio: boolean };

/** Clip-time of the n-th word of a lyric line. */
const wordAt = (line: number, n: number) => WORDS.filter((w) => w.line === line)[n]?.start ?? lineStart(line);

/**
 * The artist's "Mawa" verse (song 1:20 →), vertical 9:16.
 * Every scene is driven by the aligned word times in aligned.json.
 */
export const MawaVerse: React.FC<MawaProps> = ({ withLyrics, withAudio }) => {
  const { fps } = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);

  const T: Act1Times = {
    zalelo: wordAt(0, 1),
    mawa: wordAt(0, 3),
    breakdown: lineEnd(0) + 0.25,
    beatBack: lineStart(1) - 0.05,
    pampeni: wordAt(1, 1),
    uzafunda: wordAt(1, 2),
    mwetsera: wordAt(2, 0),
    mvetsera: wordAt(2, 1),
    nextLine: lineStart(3),
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Dawn runs a little past the impact so the ripple can reveal the night over it. */}
      <Sequence name="Dawn — inside the sun, a day passes, the slip falls" durationInFrames={f(T.beatBack + 1.2)}>
        <Dawn T={T} />
      </Sequence>
      <Sequence name="Night sea — knife moon, blanket of worry" from={f(T.beatBack)} durationInFrames={f(T.mwetsera - T.beatBack)}>
        <NightSea T={T} />
      </Sequence>
      <Sequence name="Listen — heartbeat rings → sun" from={f(T.mwetsera)} durationInFrames={f(T.nextLine - T.mwetsera + 1)}>
        <Listen T={T} />
      </Sequence>

      <Grain opacity={0.22} />
      {withLyrics ? <LyricsOverlay /> : null}

      {withAudio ? (
        // verse-window.mp3 is cut from the song starting at VERSE_START (1:20).
        <Audio name="Mawa verse" src={staticFile("mawa/verse-window.mp3")} />
      ) : null}
    </AbsoluteFill>
  );
};
