import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, EASE_IN_OUT, sec } from "./internal";

/** An SVG circle outline that draws itself on, then slowly rotates. */
export const DrawRing: React.FC<{
  size: number;
  strokeWidth?: number;
  color: string;
  delay?: number;
  duration?: number;
  /** Fraction of the ring to draw (0–1). Use < 1 for an arc. */
  arc?: number;
  dashed?: boolean;
  style?: React.CSSProperties;
}> = ({
  size,
  strokeWidth = 4,
  color,
  delay = 0,
  duration = 1.4,
  arc = 1,
  dashed = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const p = interpolate(
    frame,
    [sec(delay, fps), sec(delay + duration, fps)],
    [0, 1],
    { ...CLAMP, easing: EASE_IN_OUT },
  );
  const drawn = circumference * arc * p;

  return (
    <svg
      width={size}
      height={size}
      style={{ rotate: `${-90 + frame * 0.3}deg`, overflow: "visible", ...style }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={
          dashed ? `${strokeWidth * 2} ${strokeWidth * 3}` : `${drawn} ${circumference}`
        }
        opacity={dashed ? p : 1}
      />
    </svg>
  );
};
