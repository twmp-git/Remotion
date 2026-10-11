import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, staticFile, useVideoConfig } from "remotion";
import { CLAMP } from "../../utils/animation";
import "../TalkingStages/fonts";
import { LyricsOverlay } from "./LyricsOverlay";
import { Grain } from "./parts";
import { Dawn, Listen, NightSea, type Act1Times } from "./scenes/Act1";
import { RoadAndPlanes, type Act2Times } from "./scenes/Act2";
import { DuskRoad, Vortex, type Act3Times } from "./scenes/Act3";
import { Fire, type Act4Times } from "./scenes/Act4";
import { BlenderFire } from "./scenes/BlenderFire";
import { Finale, type FinaleTimes } from "./scenes/Finale";
import { VERSE_SECONDS, WORDS, lineEnd, lineStart } from "./timing";

export type MawaProps = { withLyrics: boolean; withAudio: boolean; fire?: "2d" | "blender" };

/** Clip-time of the n-th word of a lyric line. */
const wordAt = (line: number, n: number) => WORDS.filter((w) => w.line === line)[n]?.start ?? lineStart(line);

/**
 * The artist's "Mawa" verse (song 1:20 →), vertical 9:16.
 * Every scene is driven by the aligned word times in aligned.json.
 */
export const MawaVerse: React.FC<MawaProps> = ({ withLyrics, withAudio, fire = "2d" }) => {
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

  const A2: Act2Times = {
    start: lineStart(3),
    mabala: wordAt(3, 2),
    otisachila: wordAt(3, 3),
    abale: wordAt(3, 4),
    ndege1: lineStart(4),
    anakwera1: wordAt(4, 1),
    anapita1: wordAt(4, 2),
    ndege2: lineStart(5),
    anakwera2: wordAt(5, 1),
    anapita2: wordAt(5, 2),
    end: lineStart(6),
  };
  const A3: Act3Times = {
    start: lineStart(6),
    mabala: wordAt(6, 2),
    abale: wordAt(6, 4),
    irisAt: wordAt(6, 4) - 0.4,
    whipAt: lineStart(7) - 0.15,
    end: lineStart(7),
  };
  const A4: Act4Times = {
    whipAt: A3.whipAt,
    ma1: lineStart(7),
    beti1: wordAt(7, 1),
    anabeta1: wordAt(7, 2),
    anapita1: wordAt(7, 3),
    ma2: lineStart(8),
    anabeta2: wordAt(8, 2),
    anapita2: wordAt(8, 3),
    end: lineStart(9),
  };
  const FIN: FinaleTimes = {
    start: lineStart(9),
    hits: WORDS.filter((w) => w.line === 10).map((w) => w.start),
    reveal: lineStart(11),
    sunPulses: [wordAt(11, 1), ...WORDS.filter((w) => w.line === 12).map((w) => w.start)],
    rain: [lineStart(11), lineStart(13)],
    lastMawa: wordAt(13, 1),
    end: VERSE_SECONDS,
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
      <Sequence name="Listen — heartbeat rings → sun" from={f(T.mwetsera)} durationInFrames={f(T.nextLine) - f(T.mwetsera)}>
        <Listen T={T} />
      </Sequence>
      <Sequence name="Road at golden hour, friends, planes" from={f(A2.start)} durationInFrames={f(A2.end) - f(A2.start)}>
        <RoadAndPlanes T={A2} />
      </Sequence>
      <Sequence name="Vortex" from={f(A3.start)} durationInFrames={f(A3.irisAt + 0.05) - f(A3.start)}>
        <Vortex T={A3} />
      </Sequence>
      <Sequence name="Dusk road (empty) → whip" from={f(A3.irisAt)} durationInFrames={f(A3.whipAt + 0.35) - f(A3.irisAt)}>
        <DuskRoad T={A3} />
      </Sequence>
      <Sequence name="Fire" from={f(A4.whipAt)} durationInFrames={f(A4.end) - f(A4.whipAt)}>
        {fire === "blender" ? <BlenderFire /> : <Fire T={A4} />}
      </Sequence>
      <Sequence name="Finale — MAWA, the cover, loop" from={f(FIN.start)} durationInFrames={f(FIN.end) - f(FIN.start)}>
        <Finale T={FIN} />
      </Sequence>

      <Grain opacity={0.22} />
      {withLyrics ? <LyricsOverlay /> : null}

      {withAudio ? (
        // verse-window.mp3 is cut from the song starting at VERSE_START (1:20).
        <Audio
          name="Mawa verse"
          src={staticFile("mawa/verse-window.mp3")}
          volume={(fr) => interpolate(fr, [f(VERSE_SECONDS) - f(0.4), f(VERSE_SECONDS)], [1, 0], CLAMP)}
        />
      ) : null}
    </AbsoluteFill>
  );
};
