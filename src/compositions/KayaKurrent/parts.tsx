import React from "react";
import { Img, staticFile } from "remotion";
import { DM_SANS_OPSZ, kkFonts } from "./brand";

/** The brand red sampled from the templates. */
export const KK_RED = "#BE292D";

/**
 * The "k." logo: the user's lowercase k (logo-k-lowercase.png) plus the dot, 403×501 px,
 * with the glyph occupying x 9–392, y 8–492 (384×485).
 */
export const Logo: React.FC<{
  /** Top-left of the glyph itself. */
  x: number;
  y: number;
  /** Glyph height in px. */
  height: number;
  color?: "black" | "white";
}> = ({ x, y, height, color = "black" }) => {
  const s = height / 485;
  return (
    <Img
      src={staticFile("kaya-kurrent/logo-k.png")}
      style={{
        position: "absolute",
        left: x - 9 * s,
        top: y - 8 * s,
        width: 403 * s,
        height: 501 * s,
        filter: color === "white" ? "invert(1)" : undefined,
      }}
    />
  );
};

/** "kaya kurrent" blackletter wordmark (wordmark.png is 427×84, 2 px margin). */
export const Wordmark: React.FC<{
  x: number;
  y: number;
  width: number;
  color?: "black" | "white";
}> = ({ x, y, width, color = "black" }) => (
  <Img
    src={staticFile("kaya-kurrent/wordmark.png")}
    style={{
      position: "absolute",
      left: x,
      top: y,
      width,
      height: (width * 84) / 427,
      filter: color === "white" ? "invert(1)" : undefined,
    }}
  />
);

/**
 * A single line of DM Sans placed by its baseline (what we measure on the templates).
 * DM Sans with line-height 1 puts the baseline 0.841 em below the top of the line box.
 */
export const BaselineText: React.FC<{
  children: React.ReactNode;
  baseline: number;
  size: number;
  left?: number;
  right?: number;
  weight?: number;
  color: string;
  style?: React.CSSProperties;
}> = ({
  children,
  baseline,
  size,
  left,
  right,
  weight = 400,
  color,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      top: baseline - 0.841 * size,
      left,
      right,
      fontFamily: kkFonts.body,
      fontVariationSettings: DM_SANS_OPSZ,
      fontWeight: weight,
      fontSize: size,
      lineHeight: 1,
      color,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);
