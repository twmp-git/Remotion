import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { z } from "zod";
import { DM_SANS_OPSZ, HANDLE, kkColors, kkFonts, TAGLINE } from "./brand";
import { FitBox } from "./FitBox";
import { BaselineText, Logo, Wordmark } from "./parts";
import { RichText } from "./RichText";

export const OPPORTUNITY_YELLOW = "#CCB720";

export const opportunitySchema = z.object({
  /** Label at the top right, default "//OPPORTUNITIES". */
  kicker: z.string().optional(),
  title: z.string(),
  /** Rows such as "**Who it's for:**  Designers across Africa" (** = bold). */
  rows: z.array(z.string()),
  /** Photo in public/ shown blurred behind the card. */
  photo: z.string(),
  /** Optional different photo/crop for the vertical version. */
  storyPhoto: z.string().optional(),
  photoPosition: z.string().optional(),
  /** Blur in px at the square's scale (the template uses a heavy blur). */
  photoBlur: z.number().optional(),
});
export type OpportunityProps = z.infer<typeof opportunitySchema>;
export type OpportunityEntry = OpportunityProps & { slug: string };

type Layout = {
  size: { width: number; height: number };
  scale: number; // blur scale relative to the 1500 px square
  band: { y: number; h: number };
  card: { x: number; y: number; w: number; h: number; r: number };
  logo: { x: number; y: number; h: number };
  kicker: { right: number; top: number; size: number };
  content: { x: number; y: number; w: number; h: number; title: number };
  wordmark: {
    x: number;
    y: number;
    w: number;
    lineY: number;
    lineW: number;
    gap: number;
    thick: number;
  };
  footer: {
    tagline: { size: number; left: number; baseline: number };
    handle: { size: number; right: number; baseline: number };
  };
};

// Square: measured from the user's "AU Theme of the Year 2027 Logo Competition" template (1500×1500).
const POST: Layout = {
  size: { width: 1500, height: 1500 },
  scale: 1,
  band: { y: 396, h: 814 },
  card: { x: 163, y: 562, w: 1171, h: 756, r: 140 },
  logo: { x: 119, y: 106, h: 180 },
  kicker: { right: 1500 - 1335, top: 108, size: 90.2 },
  content: { x: 223, y: 601, w: 1040, h: 570, title: 82 },
  wordmark: {
    x: 636,
    y: 1199,
    w: 228,
    lineY: 1226,
    lineW: 122,
    gap: 38,
    thick: 2.5,
  },
  footer: {
    tagline: { size: 34, left: 110, baseline: 1424 },
    handle: { size: 27.9, right: 1500 - 1407, baseline: 1421 },
  },
};

// Vertical: designed to match the square (no reference was supplied).
const STORY: Layout = {
  size: { width: 1125, height: 2000 },
  scale: 1125 / 1500,
  band: { y: 430, h: 1080 },
  card: { x: 60, y: 640, w: 1005, h: 1090, r: 120 },
  logo: { x: 70, y: 110, h: 170 },
  kicker: { right: 70, top: 132, size: 78 },
  content: { x: 105, y: 690, w: 915, h: 880, title: 112 },
  wordmark: {
    x: 449,
    y: 1603,
    w: 228,
    lineY: 1630,
    lineW: 122,
    gap: 38,
    thick: 2.5,
  },
  footer: {
    tagline: { size: 34, left: 70, baseline: 1860 },
    handle: { size: 34, right: 70, baseline: 1860 },
  },
};

const Opportunity: React.FC<OpportunityProps & { layout: Layout }> = ({
  kicker,
  title,
  rows,
  photo,
  storyPhoto,
  photoPosition,
  photoBlur,
  layout: L,
}) => {
  const vertical = L.size.height > L.size.width;
  const wm = L.wordmark;
  const blur = (vertical && storyPhoto && photoBlur === 0 ? 14 : (photoBlur ?? 14)) * L.scale;
  const line = (left: number): React.CSSProperties => ({
    position: "absolute",
    left,
    top: wm.lineY - wm.thick / 2,
    width: wm.lineW,
    height: wm.thick,
    backgroundColor: kkColors.ink,
  });
  return (
    <AbsoluteFill style={{ backgroundColor: kkColors.white }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: L.band.y,
          width: L.size.width,
          height: L.band.h,
          overflow: "hidden",
        }}
      >
        <Img
          src={staticFile(vertical && storyPhoto ? storyPhoto : photo)}
          style={{
            position: "absolute",
            // Oversize slightly so the blur doesn't fade at the edges.
            left: -2 * blur,
            top: -2 * blur,
            width: L.size.width + 4 * blur,
            height: L.band.h + 4 * blur,
            objectFit: "cover",
            objectPosition: photoPosition ?? "50% 50%",
            filter: blur > 0 ? `blur(${blur}px)` : undefined,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: L.card.x,
          top: L.card.y,
          width: L.card.w,
          height: L.card.h,
          borderRadius: L.card.r,
          backgroundColor: OPPORTUNITY_YELLOW,
        }}
      />
      <Logo x={L.logo.x} y={L.logo.y} height={L.logo.h} />
      <div
        style={{
          position: "absolute",
          right: L.kicker.right,
          top: L.kicker.top,
          fontFamily: kkFonts.headline,
          fontSize: L.kicker.size,
          lineHeight: 1,
          color: kkColors.ink,
          whiteSpace: "nowrap",
        }}
      >
        {kicker ?? "//OPPORTUNITIES"}
      </div>

      <FitBox
        style={{
          left: L.content.x,
          top: L.content.y,
          width: L.content.w,
          height: L.content.h,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
        contentStyle={{ color: kkColors.ink, textAlign: "center" }}
        max={L.content.title}
        min={L.content.title * 0.5}
        fitKey={JSON.stringify([title, rows])}
      >
        <div
          style={{
            fontFamily: kkFonts.headline,
            lineHeight: 0.963,
            textTransform: "uppercase",
            textWrap: "balance",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: kkFonts.body,
            fontVariationSettings: DM_SANS_OPSZ,
            fontWeight: 250,
            fontSize: "0.478em",
            lineHeight: 0.94,
            marginTop: "2.02em",
            whiteSpace: "pre-wrap",
            maxWidth: "22em",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {rows.map((row, i) => (
            <div key={i} style={{ marginTop: i === 0 ? 0 : "1em" }}>
              <RichText text={row} />
            </div>
          ))}
        </div>
      </FitBox>

      <div style={line(wm.x - wm.gap - wm.lineW)} />
      <Wordmark x={wm.x} y={wm.y} width={wm.w} />
      <div style={line(wm.x + wm.w + wm.gap)} />

      <BaselineText
        baseline={L.footer.tagline.baseline}
        size={L.footer.tagline.size}
        left={L.footer.tagline.left}
        color={kkColors.ink}
      >
        {TAGLINE}
      </BaselineText>
      <BaselineText
        baseline={L.footer.handle.baseline}
        size={L.footer.handle.size}
        right={L.footer.handle.right}
        color={kkColors.ink}
      >
        {HANDLE}
      </BaselineText>
    </AbsoluteFill>
  );
};

/** Template "Opportunities Post": square, 1500×1500. */
export const OPPORTUNITY_POST_SIZE = POST.size;
export const OpportunityPost: React.FC<OpportunityProps> = (p) => (
  <Opportunity {...p} layout={POST} />
);

/** Template "Opportunities Story": vertical, 1125×2000 (designed to match the square). */
export const OPPORTUNITY_STORY_SIZE = STORY.size;
export const OpportunityStory: React.FC<OpportunityProps> = (p) => (
  <Opportunity {...p} layout={STORY} />
);
