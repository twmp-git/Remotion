import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedText, Background, PopShape, Reveal } from "../../../components";
import { colors, fonts } from "../../../theme/theme";
import { CLAMP, EASE_IN } from "../../../utils/animation";
import { useResponsive } from "../../../utils/useResponsive";

export const OutroScene: React.FC<{ cta: string }> = ({ cta }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { s } = useResponsive();

  return (
    <AbsoluteFill style={{ fontFamily: fonts.body, color: colors.text }}>
      <Background />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          padding: s(120),
          gap: s(56),
        }}
      >
        <PopShape kind="star" size={s(150)} color={colors.yellow} delay={0.2} />
        <AnimatedText
          text="Your turn."
          by="char"
          delay={0.45}
          stagger={0.04}
          style={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: s(170),
            letterSpacing: "-0.03em",
          }}
        />
        <Reveal delay={1.1} distance={s(30)}>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: s(48),
              padding: `${s(22)}px ${s(48)}px`,
              borderRadius: s(999),
              background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
              color: colors.background,
              fontWeight: 700,
            }}
          >
            {cta}
          </div>
        </Reveal>
      </AbsoluteFill>

      {/* Fade to black over the last 0.6 s */}
      <AbsoluteFill
        style={{
          backgroundColor: "black",
          opacity: interpolate(
            frame,
            [durationInFrames - 0.6 * fps, durationInFrames - 1],
            [0, 1],
            { ...CLAMP, easing: EASE_IN },
          ),
        }}
      />
    </AbsoluteFill>
  );
};
