import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";

export const INK = "#1B1012";

/**
 * SVG filter that makes outlines "boil" like hand-drawn animation:
 * the displacement noise changes seed every few frames.
 */
export const BoilFilter: React.FC<{ id: string; strength?: number; everyFrames?: number }> = ({
  id,
  strength = 5,
  everyFrames = 3,
}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / everyFrames) % 6;
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={seed} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={strength} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  );
};

/** Flat background with a soft paper grain, like a digital painting. */
export const PaperBackground: React.FC<{ color: string; grain?: number }> = ({ color, grain = 0.22 }) => (
  <AbsoluteFill style={{ backgroundColor: color }}>
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: grain, mixBlendMode: "soft-light" }}>
      <filter id="paper-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={7} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#paper-grain)" />
    </svg>
    <AbsoluteFill
      style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0.12) 100%)" }}
    />
  </AbsoluteFill>
);

/** Four-point sparkle star. */
export const Sparkle: React.FC<{ x: number; y: number; size: number; opacity: number; color?: string }> = ({
  x,
  y,
  size,
  opacity,
  color = "white",
}) => {
  const s = size / 2;
  const k = s * 0.22;
  return (
    <path
      d={`M ${x} ${y - s} Q ${x + k} ${y - k} ${x + s} ${y} Q ${x + k} ${y + k} ${x} ${y + s} Q ${x - k} ${y + k} ${x - s} ${y} Q ${x - k} ${y - k} ${x} ${y - s} Z`}
      fill={color}
      opacity={opacity}
    />
  );
};

/** A field of twinkling sparkles inside a box. Deterministic per `seed`. */
export const SparkleField: React.FC<{
  seed: string;
  count: number;
  x: number;
  y: number;
  w: number;
  h: number;
  maxSize?: number;
  color?: string;
}> = ({ seed, count, x, y, w, h, maxSize = 28, color }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const period = 30 + random(`${seed}-p-${i}`) * 50;
        const phase = random(`${seed}-ph-${i}`) * Math.PI * 2;
        const tw = Math.max(0, Math.sin((frame / period) * Math.PI * 2 + phase));
        return (
          <Sparkle
            key={i}
            x={x + random(`${seed}-x-${i}`) * w}
            y={y + random(`${seed}-y-${i}`) * h}
            size={(0.4 + random(`${seed}-s-${i}`) * 0.6) * maxSize * (0.6 + tw * 0.4)}
            opacity={tw * 0.9}
            color={color}
          />
        );
      })}
    </>
  );
};
