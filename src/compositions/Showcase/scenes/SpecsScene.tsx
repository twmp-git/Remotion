import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedText, Background, GrowLine, Reveal } from "../../../components";
import { sec } from "../../../config/video";
import { colors, fonts } from "../../../theme/theme";
import { countUp } from "../../../utils/animation";
import { useResponsive } from "../../../utils/useResponsive";

/** Kinetic stats that read the live composition settings. */
export const SpecsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const { s, isPortrait } = useResponsive();

  const stats = [
    { value: width, label: "pixels wide", color: colors.primary },
    { value: height, label: "pixels tall", color: colors.accent },
    { value: fps, label: "frames / second", color: colors.warm },
  ];

  return (
    <AbsoluteFill style={{ fontFamily: fonts.body, color: colors.text }}>
      <Background
        orbs={[
          { color: colors.warm, x: 0.15, y: 0.2, size: 0.5, period: 11 },
          { color: colors.primary, x: 0.85, y: 0.85, size: 0.6, period: 9 },
        ]}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          padding: s(120),
          gap: s(80),
        }}
      >
        <AnimatedText
          text="Any format. Every frame."
          delay={0.15}
          stagger={0.09}
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
            flexDirection: isPortrait ? "column" : "row",
            gap: s(48),
          }}
        >
          {stats.map((stat, i) => {
            const delay = 0.7 + i * 0.18;
            return (
              <Reveal key={stat.label} delay={delay} distance={s(60)}>
                <div
                  style={{
                    width: s(440),
                    padding: s(48),
                    borderRadius: s(32),
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: `${s(2)}px solid rgba(255,255,255,0.12)`,
                    boxShadow: `0 ${s(30)}px ${s(80)}px rgba(0,0,0,0.35)`,
                    display: "flex",
                    flexDirection: "column",
                    gap: s(18),
                  }}
                >
                  <div
                    style={{
                      fontFamily: fonts.display,
                      fontWeight: 700,
                      fontSize: s(120),
                      lineHeight: 1,
                      color: stat.color,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {countUp(frame, sec(delay, fps), sec(1.2, fps), stat.value)}
                  </div>
                  <GrowLine width={s(120)} thickness={s(6)} color={stat.color} delay={delay + 0.3} />
                  <div style={{ fontSize: s(44), color: colors.muted }}>{stat.label}</div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
