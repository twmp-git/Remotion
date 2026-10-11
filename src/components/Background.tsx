import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme/theme";
import { wave } from "../utils/animation";

type Orb = { color: string; x: number; y: number; size: number; period: number };

const DEFAULT_ORBS: Orb[] = [
  { color: colors.primary, x: 0.18, y: 0.25, size: 0.55, period: 9 },
  { color: colors.accent, x: 0.82, y: 0.7, size: 0.5, period: 11 },
  { color: colors.warm, x: 0.65, y: 0.15, size: 0.35, period: 13 },
];

/**
 * Animated gradient background: slow drifting light orbs, a moving grid and a vignette.
 * Purely frame-driven, so it renders identically every time.
 */
export const Background: React.FC<{
  orbs?: Orb[];
  base?: string;
  showGrid?: boolean;
}> = ({ orbs = DEFAULT_ORBS, base = colors.background, showGrid = true }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const unit = Math.max(width, height);
  const gridSize = Math.round(unit / 24);

  return (
    <AbsoluteFill style={{ backgroundColor: base, overflow: "hidden" }}>
      {orbs.map((orb, i) => {
        const size = orb.size * unit;
        const dx = wave(frame, orb.period * fps, unit * 0.04, i);
        const dy = wave(frame, orb.period * fps * 1.3, unit * 0.03, i * 2);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: orb.x * width - size / 2,
              top: orb.y * height - size / 2,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${orb.color}55 0%, ${orb.color}00 65%)`,
              translate: `${dx}px ${dy}px`,
            }}
          />
        );
      })}
      {showGrid ? (
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${colors.text}0D 1px, transparent 1px), linear-gradient(90deg, ${colors.text}0D 1px, transparent 1px)`,
            backgroundSize: `${gridSize}px ${gridSize}px`,
            backgroundPosition: `0px ${(frame * 0.4) % gridSize}px`,
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
      ) : null}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
