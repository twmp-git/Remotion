import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP } from "../../utils/animation";
import "../TalkingStages/fonts";
import { LyricsOverlay } from "./LyricsOverlay";
import { Grain } from "./parts";
import { KnifeEdge, ListenRipples, SunriseHook } from "./scenes/OpeningScenes";
import { WORDS, lineStart } from "./timing";

export type MawaProps = { withLyrics: boolean; withAudio: boolean };

/** Beat-synced micro camera shake + flash on downbeats (112 BPM). */
const useBeatKick = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beat = 60 / 112;
  const since = (frame / fps) % beat;
  return interpolate(since, [0, 0.12], [1, 0], CLAMP);
};

/**
 * The artist's "Mawa" verse (song 1:20 →), vertical 9:16.
 * Scenes are placed on the lyric line times from timing.ts.
 */
export const MawaVerse: React.FC<MawaProps & { endAt?: number }> = ({ withLyrics, withAudio }) => {
  const { fps } = useVideoConfig();
  const kick = useBeatKick();
  const f = (s: number) => Math.round(s * fps);
  const mvetseraHits = WORDS.filter((w) => w.line === 2).map((w) => w.start - lineStart(2));

  const s1 = lineStart(1);
  const s2 = lineStart(2);
  const s3 = lineStart(3);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ scale: String(1 + kick * 0.012) }}>
        <Sequence name="Hook: sunrise + multiplier" durationInFrames={f(s1)}>
          <SunriseHook dur={s1} />
        </Sequence>
        <Sequence name="Knife edge" from={f(s1)} durationInFrames={f(s2 - s1)}>
          <KnifeEdge dur={s2 - s1} />
        </Sequence>
        <Sequence name="Listen ripples" from={f(s2)} durationInFrames={f(s3 - s2)}>
          <ListenRipples dur={s3 - s2} hits={mvetseraHits} />
        </Sequence>
      </AbsoluteFill>

      <Grain />
      {withLyrics ? <LyricsOverlay /> : null}

      {withAudio ? (
        <Audio
          name="Mawa verse"
          // verse-window.mp3 is cut from the song starting at VERSE_START.
          src={staticFile("mawa/verse-window.mp3")}
        />
      ) : null}
    </AbsoluteFill>
  );
};
