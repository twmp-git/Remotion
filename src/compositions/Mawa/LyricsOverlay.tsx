import React from "react";
import { Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP } from "../../utils/animation";
import { MAWA } from "./theme";
import { LINE_TIMES, WORDS } from "./timing";

const KEY_WORDS = /^(mawa|anapita|ndege|beti|anabeta|mabala|abale|mvetsera|mwetsera|nkhawa|uzafundankhawa)$/i;

/**
 * Kinetic Chichewa lyrics: each word slams in on its sung time, the line holds until the
 * next one. Sits in the lower-middle safe zone (clear of TikTok's caption + side buttons).
 */
export const LyricsOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const line = LINE_TIMES.findIndex((l, i) => t >= l.start - 0.05 && (i + 1 >= LINE_TIMES.length || t < LINE_TIMES[i + 1].start - 0.05));
  if (line < 0) return null;
  const words = WORDS.filter((w) => w.line === line);
  const nextStart = LINE_TIMES[line + 1]?.start ?? Infinity;
  const exit = interpolate(t, [nextStart - 0.22, nextStart - 0.02], [0, 1], { ...CLAMP, easing: Easing.bezier(0.5, 0, 0.75, 0) });

  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 150,
        top: 880,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignContent: "flex-start",
        columnGap: 22,
        rowGap: 0,
        opacity: 1 - exit,
        translate: `0 ${exit * -40}px`,
        filter: `blur(${exit * 8}px)`,
      }}
    >
      {words.map((w, i) => {
        const sinceIn = t - w.start;
        if (sinceIn < -0.02) return null;
        const pop = interpolate(sinceIn, [0, 0.28], [0, 1], { ...CLAMP, easing: Easing.bezier(0.16, 1, 0.3, 1) });
        const key = KEY_WORDS.test(w.word.replace(/[^a-z]/gi, ""));
        const tilt = (random(`mw-${line}-${i}`) - 0.5) * (key ? 5 : 2.5);
        return (
          <span
            key={i}
            style={{
              fontFamily: "Anton, Impact, sans-serif",
              fontSize: key ? 132 : 104,
              lineHeight: 1.04,
              textTransform: "uppercase",
              color: key ? MAWA.orange : MAWA.paperLight,
              WebkitTextStroke: `12px ${MAWA.ink}`,
              paintOrder: "stroke fill",
              textShadow: `0 10px 0 ${MAWA.ink}`,
              display: "inline-block",
              scale: String(interpolate(pop, [0, 1], [1.35, 1])),
              opacity: interpolate(pop, [0, 0.4], [0, 1], CLAMP),
              filter: `blur(${(1 - pop) * 10}px)`,
              translate: `0 ${(1 - pop) * 24}px`,
              rotate: `${tilt}deg`,
            }}
          >
            {w.word.replace(/,/g, "")}
          </span>
        );
      })}
    </div>
  );
};
