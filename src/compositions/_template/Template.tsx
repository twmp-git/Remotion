import React from "react";
import { z } from "zod";
import { AbsoluteFill } from "remotion";
import { AnimatedText, Background, Reveal } from "../../components";
import { colors, fonts } from "../../theme/theme";
import { useResponsive } from "../../utils/useResponsive";

// Template used by `npm run new -- <Name>`. "TemplateComp" is replaced with the new name.

export const TemplateCompSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
});

export type TemplateCompProps = z.infer<typeof TemplateCompSchema>;

/** Length in seconds. Converted to frames in Root.tsx. */
export const TemplateComp_SECONDS = 5;

export const TemplateComp: React.FC<TemplateCompProps> = ({ title, subtitle }) => {
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
          gap: s(32),
        }}
      >
        <AnimatedText
          text={title}
          delay={0.2}
          style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: s(140) }}
        />
        <Reveal delay={0.8}>
          <div style={{ fontSize: s(48), color: colors.muted }}>{subtitle}</div>
        </Reveal>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
