import React from "react";
import { AbsoluteFill } from "remotion";
import { AnimatedText, Background, DrawRing, GrowLine, Reveal } from "../../../components";
import { colors, fonts } from "../../../theme/theme";
import { useResponsive } from "../../../utils/useResponsive";

export const IntroScene: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => {
  const { s } = useResponsive();

  return (
    <AbsoluteFill style={{ fontFamily: fonts.body, color: colors.text }}>
      <Background />

      {/* Decorative rings behind the title */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <DrawRing size={s(760)} strokeWidth={s(3)} color={colors.accent} dashed delay={0.2} duration={1} style={{ opacity: 0.5 }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <DrawRing size={s(640)} strokeWidth={s(6)} color={colors.primary} arc={0.75} delay={0.1} style={{ opacity: 0.55 }} />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          padding: s(120),
          textAlign: "center",
        }}
      >
        <Reveal delay={0.2} from="top" distance={s(20)}>
          <div
            style={{
              fontSize: s(30),
              fontWeight: 600,
              letterSpacing: "0.32em",
              color: colors.accent,
              marginBottom: s(28),
            }}
          >
            REMOTION · MOTION GRAPHICS
          </div>
        </Reveal>
        <AnimatedText
          text={title}
          delay={0.4}
          stagger={0.12}
          style={{
            fontFamily: fonts.display,
            fontWeight: 700,
            fontSize: s(150),
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        />
        <GrowLine
          width={s(360)}
          thickness={s(10)}
          color={colors.warm}
          origin="center"
          delay={1.0}
          style={{ marginTop: s(36), marginBottom: s(36) }}
        />
        <Reveal delay={1.3} blur>
          <div style={{ fontSize: s(48), color: colors.muted }}>{subtitle}</div>
        </Reveal>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
