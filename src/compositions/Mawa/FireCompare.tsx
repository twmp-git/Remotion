import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import "../TalkingStages/fonts";
import { Grain } from "./parts";
import { BlenderFire } from "./scenes/BlenderFire";
import { Fire, type Act4Times } from "./scenes/Act4";
import { MAWA } from "./theme";
import { WORDS, lineStart } from "./timing";

const wordAt = (line: number, n: number) => WORDS.filter((w) => w.line === line)[n]?.start ?? lineStart(line);

const Label: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      position: "absolute",
      top: 150,
      left: 70,
      padding: "14px 30px",
      background: MAWA.ink,
      color: MAWA.paperLight,
      fontFamily: "Anton, Impact, sans-serif",
      fontSize: 64,
      letterSpacing: 4,
      border: `4px solid ${MAWA.orange}`,
    }}
  >
    {text}
  </div>
);

/** A/B: the "ma beti anabeta anapita" fire, first in 2D (as in the final video), then rendered in Blender. */
export const FireCompare: React.FC = () => {
  const { fps } = useVideoConfig();
  const A4: Act4Times = {
    whipAt: lineStart(7) - 0.15,
    ma1: lineStart(7),
    beti1: wordAt(7, 1),
    anabeta1: wordAt(7, 2),
    anapita1: wordAt(7, 3),
    ma2: lineStart(8),
    anabeta2: wordAt(8, 2),
    anapita2: wordAt(8, 3),
    end: lineStart(9),
  };
  const len = Math.round((A4.end - A4.whipAt) * fps);
  const songFrom = Math.round(A4.whipAt * fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence name="2D" durationInFrames={len}>
        <Fire T={A4} />
        <Grain opacity={0.22} />
        <Label text="2D (CURRENT)" />
        <Audio src={staticFile("mawa/verse-window.mp3")} trimBefore={songFrom} />
      </Sequence>
      <Sequence name="Blender" from={len} durationInFrames={len}>
        <BlenderFire />
        <Grain opacity={0.22} />
        <Label text="BLENDER" />
        <Audio src={staticFile("mawa/verse-window.mp3")} trimBefore={songFrom} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const FIRE_COMPARE_FRAMES = (fps: number) => 2 * Math.round((lineStart(9) - (lineStart(7) - 0.15)) * fps);
