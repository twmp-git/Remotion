import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import {
  AnimatedText,
  Background,
  PopShape,
  Reveal,
  type ShapeKind,
} from "../../../components";
import { sec } from "../../../config/video";
import { colors, fonts } from "../../../theme/theme";
import { useResponsive } from "../../../utils/useResponsive";

const SHAPES: { kind: ShapeKind; color: string; label: string }[] = [
  { kind: "circle", color: colors.primary, label: "Spring" },
  { kind: "square", color: colors.accent, label: "Interpolate" },
  { kind: "triangle", color: colors.warm, label: "Easing" },
  { kind: "star", color: colors.yellow, label: "Sequence" },
];

/** Seconds into the scene when the first shape pops, and the gap between shapes. */
const FIRST_POP = 0.9;
const POP_GAP = 0.22;

export const ShapesScene: React.FC<{ withAudio: boolean }> = ({ withAudio }) => {
  const { fps } = useVideoConfig();
  const { s, isPortrait } = useResponsive();

  return (
    <AbsoluteFill style={{ fontFamily: fonts.body, color: colors.text }}>
      <Background
        base={colors.backgroundAlt}
        orbs={[
          { color: colors.accent, x: 0.2, y: 0.8, size: 0.6, period: 10 },
          { color: colors.primary, x: 0.85, y: 0.2, size: 0.55, period: 12 },
        ]}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          padding: s(120),
          gap: s(90),
        }}
      >
        <AnimatedText
          text="Shapes that move with code"
          delay={0.15}
          stagger={0.08}
          style={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: s(104),
            letterSpacing: "-0.02em",
          }}
        />
        <div
          style={{
            display: "flex",
            flexWrap: isPortrait ? "wrap" : "nowrap",
            justifyContent: "center",
            gap: s(110),
          }}
        >
          {SHAPES.map((shape, i) => {
            const delay = FIRST_POP + i * POP_GAP;
            return (
              <div
                key={shape.kind}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: s(36) }}
              >
                <PopShape kind={shape.kind} size={s(190)} color={shape.color} delay={delay} />
                <Reveal delay={delay + 0.25} distance={s(16)}>
                  <div style={{ fontSize: s(44), fontWeight: 600, color: colors.muted }}>
                    {shape.label}
                  </div>
                </Reveal>
                {/* Audio sync: each pop sound starts on the exact frame its shape appears. */}
                {withAudio ? (
                  <Audio
                    src={staticFile("audio/pop.mp3")}
                    from={sec(delay, fps)}
                    volume={0.5}
                    name={`Pop ${shape.label}`}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
