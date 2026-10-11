import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, EASE_OUT, sec } from "./internal";

/** A bar that grows from its left (or center) edge — underlines, dividers, progress. */
export const GrowLine: React.FC<{
  width: number;
  thickness?: number;
  color: string;
  delay?: number;
  duration?: number;
  origin?: "left" | "center";
  style?: React.CSSProperties;
}> = ({
  width,
  thickness = 8,
  color,
  delay = 0,
  duration = 0.8,
  origin = "left",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(
    frame,
    [sec(delay, fps), sec(delay + duration, fps)],
    [0, 1],
    { ...CLAMP, easing: EASE_OUT },
  );
  return (
    <div
      style={{
        width,
        height: thickness,
        borderRadius: thickness,
        backgroundColor: color,
        scale: `${p} 1`,
        transformOrigin: origin === "left" ? "left center" : "center",
        ...style,
      }}
    />
  );
};
