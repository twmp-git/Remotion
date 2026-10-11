import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, EASE_OUT, sec } from "./internal";

type Props = {
  text: string;
  /** Start time in seconds (relative to the parent Sequence). */
  delay?: number;
  /** Seconds between each word/character starting. */
  stagger?: number;
  /** Seconds each word/character takes to animate in. */
  duration?: number;
  /** Split the text into words or characters. */
  by?: "word" | "char";
  /** Optional exit: seconds (relative) at which the text slides out again. */
  exitAt?: number;
  style?: React.CSSProperties;
};

/**
 * Kinetic typography: each word (or character) slides up from behind a mask
 * with a slight rotation and fade, staggered over time.
 */
export const AnimatedText: React.FC<Props> = ({
  text,
  delay = 0,
  stagger = 0.06,
  duration = 0.7,
  by = "word",
  exitAt,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const parts = by === "word" ? text.split(" ") : Array.from(text);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: by === "word" ? "0.28em" : 0,
        ...style,
      }}
    >
      {parts.map((part, i) => {
        const start = sec(delay + i * stagger, fps);
        const enter = interpolate(
          frame,
          [start, start + sec(duration, fps)],
          [0, 1],
          { ...CLAMP, easing: EASE_OUT },
        );
        const exit =
          exitAt === undefined
            ? 0
            : interpolate(
                frame,
                [sec(exitAt + i * stagger * 0.5, fps), sec(exitAt + i * stagger * 0.5 + 0.4, fps)],
                [0, 1],
                { ...CLAMP, easing: EASE_OUT },
              );
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              overflow: "hidden",
              // Leave room for descenders inside the mask.
              paddingBottom: "0.12em",
              marginBottom: "-0.12em",
            }}
          >
            <span
              style={{
                display: "inline-block",
                whiteSpace: "pre",
                opacity: enter * (1 - exit),
                translate: `0 ${(1 - enter) * 110 - exit * 110}%`,
                rotate: `${(1 - enter) * 6}deg`,
              }}
            >
              {part === " " ? " " : part}
            </span>
          </span>
        );
      })}
    </div>
  );
};
