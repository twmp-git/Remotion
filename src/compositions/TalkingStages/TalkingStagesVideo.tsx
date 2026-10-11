import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, SPRINGS, springIn, wave } from "../../utils/animation";
import "./fonts";
import { BoilFilter, PaperBackground, SparkleField } from "./illustration/HandDrawn";
import { HandBack, HandFront } from "./illustration/Hand";
import { CUES, HOOK_SECONDS, HOT_WORDS, beatPulse, getCue } from "./lyrics";
import { RETRO_H, RETRO_W, RetroBarPhone } from "./phones/RetroBarPhone";
import { FlipPhone } from "./phones/FlipPhone";
import { QwertyPhone } from "./phones/QwertyPhone";
import { makeSlabPhone } from "./phones/SlabPhone";
import type { Variant } from "./variants";

// All phones share one 440×1000 footprint so the hand fits every model.
const PHONES = {
  "retro-bar": { Component: RetroBarPhone, W: RETRO_W, H: RETRO_H },
  qwerty: { Component: QwertyPhone, W: RETRO_W, H: RETRO_H },
  flip: { Component: FlipPhone, W: RETRO_W, H: RETRO_H },
  ios: { Component: makeSlabPhone("ios"), W: RETRO_W, H: RETRO_H },
  android: { Component: makeSlabPhone("android"), W: RETRO_W, H: RETRO_H },
};

export const TalkingStagesVideo: React.FC<{ variant: Variant; withAudio: boolean }> = ({ variant, withAudio }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const cue = getCue(t);
  const phone = PHONES[variant.phone];
  const { W, H } = phone;

  // --- Motion -------------------------------------------------------------
  const enter = springIn(frame, fps, 0, SPRINGS.snappy, Math.round(0.5 * fps));
  const pulse = beatPulse(t, 0.22);
  const currentWord = cue ? cue.words[cue.wordIndex]?.toLowerCase().replace(/[^a-z']/g, "") : "";
  const hotHit =
    cue && HOT_WORDS.has(currentWord ?? "")
      ? interpolate(t - cue.wordTimes[cue.wordIndex], [0, 0.45], [1, 0], CLAMP)
      : 0;
  const shakeX = Math.sin(frame * 2.7) * 14 * hotHit;
  const shakeR = Math.sin(frame * 3.3) * 2.2 * hotHit;

  const scale = 1.72 + pulse * 0.02;
  const rot = -11 + wave(frame, 7 * fps, 2) + shakeR;
  const cx = width / 2 + 20 + shakeX;
  const cy = height * 0.6 + interpolate(enter, [0, 1], [1400, 0]) + wave(frame, 4 * fps, 12);

  // Thumb taps a key while the line is being typed.
  const typing = cue ? cue.typedChars < cue.cue.text.length : false;
  const tapPulse = typing ? beatPulse(t * 2, 0.12) : 0;
  const activeKey =
    cue && typing && tapPulse > 0.3 ? Math.floor(random(`key-${cue.index}-${cue.typedChars >> 2}`) * 12) : null;

  // White flash on each new line.
  const flash = cue ? interpolate(cue.elapsed, [0, 0.12], [0.35, 0], CLAMP) : 0;
  const fadeOut = interpolate(frame, [durationInFrames - 0.6 * fps, durationInFrames - 1], [0, 1], CLAMP);

  const Phone = phone.Component;

  return (
    <AbsoluteFill>
      <PaperBackground color={variant.background} />

      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <BoilFilter id={`boil-${variant.id}`} strength={5} />
        </defs>
        <SparkleField seed={`${variant.id}-bg`} count={14} x={40} y={80} w={width - 80} h={height - 160} maxSize={36} color={variant.sparkle} />
        <g
          filter={`url(#boil-${variant.id})`}
          transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${scale}) translate(${-W / 2} ${-H / 2})`}
        >
          <HandBack hand={variant.hand} W={W} H={H} />
          <Phone
            caseColor={variant.caseColor}
            text={cue?.cue.text ?? ""}
            typedChars={cue?.typedChars ?? 0}
            sinceCue={cue?.elapsed ?? 99}
            activeKey={activeKey}
            words={cue?.words ?? []}
            wordIndex={cue?.wordIndex ?? -1}
            cueIndex={cue?.index ?? -1}
            history={cue ? CUES.slice(Math.max(0, cue.index - 2), cue.index).map((c) => c.text) : []}
          />
          <SparkleField seed={`${variant.id}-phone`} count={6} x={40} y={40} w={W - 80} h={H * 0.5} maxSize={30} color="#FFFFFF" />
          <HandFront hand={variant.hand} W={W} H={H} thumbPress={tapPulse * 10} />
        </g>
      </svg>

      <AbsoluteFill style={{ backgroundColor: "white", opacity: flash, pointerEvents: "none" }} />
      <AbsoluteFill style={{ backgroundColor: variant.background, opacity: fadeOut }} />

      {withAudio ? (
        <Audio
          name="Talking Stages (hook)"
          src={staticFile("talking-stages/hook.mp3")}
          volume={(f) => interpolate(f, [0, 3, HOOK_SECONDS * fps - 0.6 * fps, HOOK_SECONDS * fps], [0, 1, 1, 0], CLAMP)}
        />
      ) : null}
    </AbsoluteFill>
  );
};
