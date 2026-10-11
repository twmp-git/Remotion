import React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, EASE_IN, SPRINGS, springIn } from "../../utils/animation";
import { tsFonts } from "./fonts";
import { HOT_WORDS, getCue } from "./lyrics";
import { INK } from "./illustration/HandDrawn";

/**
 * Big sticker-style lyric words that slam in one by one, in time with the vocal.
 * "Hot" words (die, one) get a bigger hit and an accent colour.
 */
export const StickerLyrics: React.FC<{ textColor: string; hotColor: string; shadowColor: string; top: number }> = ({
  textColor,
  hotColor,
  shadowColor,
  top,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cue = getCue(t);
  if (!cue) return null;

  // Whole line pops out just before the next one.
  const exit = interpolate(t, [cue.cue.end - 0.18, cue.cue.end - 0.02], [0, 1], { ...CLAMP, easing: EASE_IN });

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 70,
        right: 70,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignContent: "flex-start",
        columnGap: 26,
        rowGap: 4,
        opacity: 1 - exit,
        scale: String(1 - exit * 0.15),
      }}
    >
      {cue.words.map((word, i) => {
        if (i > cue.wordIndex) return null;
        const startFrame = Math.round(cue.wordTimes[i] * fps);
        const clean = word.toLowerCase().replace(/[^a-z']/g, "");
        const hot = HOT_WORDS.has(clean);
        const pop = springIn(frame, fps, startFrame, hot ? SPRINGS.bouncy : SPRINGS.snappy);
        const tilt = (random(`tilt-${cue.index}-${i}`) - 0.5) * (hot ? 12 : 7);
        const shake = hot ? Math.sin(frame * 2.1) * interpolate(frame - startFrame, [0, 12], [10, 0], CLAMP) : 0;
        return (
          <span
            key={i}
            style={{
              fontFamily: tsFonts.lyric,
              fontSize: hot ? 190 : 150,
              lineHeight: 1.02,
              textTransform: "uppercase",
              color: hot ? hotColor : textColor,
              WebkitTextStroke: `14px ${INK}`,
              paintOrder: "stroke fill",
              textShadow: `0 12px 0 ${shadowColor}`,
              display: "inline-block",
              scale: String(interpolate(pop, [0, 1], [hot ? 2.2 : 1.6, 1])),
              opacity: interpolate(pop, [0, 0.25], [0, 1], CLAMP),
              rotate: `${tilt}deg`,
              translate: `${shake}px 0px`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
