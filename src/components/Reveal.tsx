import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, EASE_OUT, sec } from "./internal";

type Props = {
  children: React.ReactNode;
  /** Start time in seconds. */
  delay?: number;
  /** Animation length in seconds. */
  duration?: number;
  /** Direction the element travels in from. */
  from?: "bottom" | "top" | "left" | "right" | "none";
  /** Travel distance in px. */
  distance?: number;
  /** Also blur in. */
  blur?: boolean;
  style?: React.CSSProperties;
};

/** Generic fade + slide (+ optional blur) entrance for any element. */
export const Reveal: React.FC<Props> = ({
  children,
  delay = 0,
  duration = 0.8,
  from = "bottom",
  distance = 40,
  blur = false,
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
  const offset = (1 - p) * distance;
  const translate = {
    bottom: `0px ${offset}px`,
    top: `0px ${-offset}px`,
    left: `${-offset}px 0px`,
    right: `${offset}px 0px`,
    none: "0px 0px",
  }[from];

  return (
    <div
      style={{
        opacity: p,
        translate,
        filter: blur ? `blur(${(1 - p) * 12}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
