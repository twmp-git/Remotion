import React from "react";
import { Circle, Rect, Star, Triangle } from "@remotion/shapes";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, SPRINGS, sec } from "./internal";
import { springIn, wave } from "../utils/animation";

export type ShapeKind = "circle" | "square" | "triangle" | "star";

/**
 * A vector shape (from @remotion/shapes) that pops in with a bouncy spring,
 * spins into place and then gently floats.
 */
export const PopShape: React.FC<{
  kind: ShapeKind;
  size: number;
  color: string;
  delay?: number;
  float?: boolean;
  style?: React.CSSProperties;
}> = ({ kind, size, color, delay = 0, float = true, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = sec(delay, fps);
  const pop = springIn(frame, fps, start, SPRINGS.bouncy);
  const spin = interpolate(pop, [0, 1], [-120, 0], CLAMP);
  const bob = float ? wave(Math.max(0, frame - start), 2.5 * fps, size * 0.06) : 0;

  const shape = {
    circle: <Circle radius={size / 2} fill={color} />,
    square: <Rect width={size * 0.88} height={size * 0.88} cornerRadius={size * 0.16} fill={color} />,
    triangle: <Triangle length={size} direction="up" fill={color} cornerRadius={size * 0.08} />,
    star: (
      <Star
        points={5}
        innerRadius={size * 0.24}
        outerRadius={size / 2}
        fill={color}
        cornerRadius={size * 0.04}
      />
    ),
  }[kind];

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        scale: String(Math.max(0, pop)),
        rotate: `${spin}deg`,
        translate: `0px ${bob}px`,
        filter: `drop-shadow(0 ${size * 0.12}px ${size * 0.2}px ${color}66)`,
        ...style,
      }}
    >
      {shape}
    </div>
  );
};
