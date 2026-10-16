import React from "react";
import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { DM_SANS_OPSZ, HANDLE, kkColors, kkFonts, TAGLINE } from "./brand";
import { FitBox } from "./FitBox";
import { BaselineText, KK_RED, Logo, Wordmark } from "./parts";
import { RichText } from "./RichText";

export const noticeSchema = z.object({
  /** Red label at the top right, e.g. "//PUBLIC NOTICE". */
  kicker: z.string().optional(),
  /** "\n" chooses where the title breaks (keep phrases and names whole). */
  title: z.string(),
  /** Different breaks for the vertical, when the square's lines are too long for it. */
  storyTitle: z.string().optional(),
  /** Lines such as "**Petrol:** MK 2,530.00 per litre" (** = bold). */
  items: z.array(z.string()).optional(),
  /** Optional paragraph instead of / after the items (** = bold). */
  body: z.string().optional(),
  /** e.g. "Source: MERA public notice, 3 October 2026". */
  source: z.string().optional(),
});
export type NoticeProps = z.infer<typeof noticeSchema>;
export type NoticeEntry = NoticeProps & { slug: string };

type Layout = {
  size: { width: number; height: number };
  split: number; // black above, white below
  panel: { x: number; y: number; w: number; h: number; r: number };
  logo: { x: number; y: number; h: number };
  kicker: { right: number; top: number; size: number };
  content: {
    x: number;
    y: number;
    w: number;
    h: number;
    title: number;
    center?: boolean;
    /** Title line height (the user's vertical sets the title tighter than the square). */
    titleLineHeight: number;
    /** Item and source sizes in em of the title. */
    items: number;
    source: number;
    /** Title letter-spacing (the square is set tight; the vertical is not). */
    tracking: string;
  };
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
    baseline: number;
    tagline: number;
    handle: number;
    left: number;
    right: number;
    /** The user's vertical templates set the footer in Arial (Arimo), with the handle at a fixed x. */
    arial?: { handleLeft: number };
  };
};

// Square: measured from the user's "MERA ADJUSTS FUEL PUMP PRICES" template (2000×2000).
const POST: Layout = {
  size: { width: 2000, height: 2000 },
  split: 1562,
  panel: { x: 91, y: 567, w: 1817, h: 1110, r: 190 },
  logo: { x: 48, y: 127, h: 240 },
  kicker: { right: 2000 - 1890, top: 190, size: 120 },
  content: { x: 258, y: 677, w: 1480, h: 743, title: 169, titleLineHeight: 1.065, items: 0.4325, source: 0.193, tracking: "-0.025em" },
  wordmark: {
    x: 845,
    y: 1512,
    w: 307,
    lineY: 1546,
    lineW: 167,
    gap: 46,
    thick: 4,
  },
  footer: {
    baseline: 1846,
    tagline: 45.7,
    handle: 50.8,
    left: 94,
    right: 2000 - 1870,
  },
};

// Vertical: measured from the user's vertical "MERA ADJUSTS FUEL PUMP PRICES" template (1125×2000), with its
// errors fixed: the handle was misspelt "@kayacurrent" (HANDLE is drawn instead) and the price lines touched.
const STORY: Layout = {
  size: { width: 1125, height: 2000 },
  split: 1309,
  panel: { x: 95, y: 746, w: 939, h: 863, r: 140 },
  logo: { x: 86, y: 497, h: 136 },
  kicker: { right: 88, top: 533, size: 68 },
  content: { x: 186, y: 896, w: 790, h: 550, title: 115, titleLineHeight: 0.89, items: 0.358, source: 0.155, tracking: "0em" },
  wordmark: {
    x: 476,
    y: 1477,
    w: 173,
    lineY: 1496,
    lineW: 94,
    gap: 26,
    thick: 2.5,
  },
  footer: { baseline: 1841, tagline: 41.7, handle: 41.7, left: 96, right: 0, arial: { handleLeft: 697 } },
};

/** Footer text in Arial metrics (Arimo), placed by its baseline. */
const ArialText: React.FC<{ children: React.ReactNode; baseline: number; size: number; left: number }> = ({
  children,
  baseline,
  size,
  left,
}) => (
  <div
    style={{
      position: "absolute",
      left,
      top: baseline - 0.905 * size,
      fontFamily: kkFonts.storyFooter,
      fontSize: size,
      lineHeight: 1,
      color: kkColors.ink,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

const Notice: React.FC<NoticeProps & { layout: Layout }> = ({
  kicker,
  title,
  storyTitle,
  items,
  body,
  source,
  layout: L,
}) => {
  const wm = L.wordmark;
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
          top: 0,
          right: 0,
          height: L.split,
          backgroundColor: kkColors.ink,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: L.panel.x,
          top: L.panel.y,
          width: L.panel.w,
          height: L.panel.h,
          borderRadius: L.panel.r,
          backgroundColor: KK_RED,
        }}
      />
      <Logo x={L.logo.x} y={L.logo.y} height={L.logo.h} color="white" />
      <div
        style={{
          position: "absolute",
          right: L.kicker.right,
          top: L.kicker.top,
          fontFamily: kkFonts.headline,
          fontSize: L.kicker.size,
          lineHeight: 1,
          color: KK_RED,
          whiteSpace: "nowrap",
        }}
      >
        {kicker ?? "//PUBLIC NOTICE"}
      </div>

      {/* Title, items and source scale together (sizes in em of the title). */}
      <FitBox
        style={{
          left: L.content.x,
          top: L.content.y,
          width: L.content.w,
          height: L.content.h,
          display: "flex",
          flexDirection: "column",
          justifyContent: L.content.center ? "center" : "flex-start",
        }}
        contentStyle={{ color: kkColors.ink }}
        max={L.content.title}
        min={L.content.title * 0.45}
        fitKey={JSON.stringify([title, storyTitle, items, body, source])}
      >
        <div
          style={{
            fontFamily: kkFonts.headline,
            lineHeight: L.content.titleLineHeight,
            letterSpacing: L.content.tracking,
            textTransform: "uppercase",
            // Lines break only at "\n"; a line that is too wide shrinks the title instead of wrapping.
            whiteSpace: "pre",
          }}
        >
          {(L === STORY && storyTitle) || title}
        </div>
        <div
          style={{
            fontFamily: kkFonts.body,
            fontVariationSettings: DM_SANS_OPSZ,
            fontWeight: 300,
          }}
        >
          {items && items.length > 0 ? (
            <div
              style={{
                // Fixed size (like the Opportunities rows): only the title shrinks to make room.
                fontSize: L.content.title * L.content.items,
                // The template's 0.97 made descenders ("per") touch the next line.
                lineHeight: 1.12,
                marginTop: "0.25em",
              }}
            >
              {items.map((item, i) => (
                <div key={i}>
                  <RichText text={item} />
                </div>
              ))}
            </div>
          ) : null}
          {body ? (
            <div
              style={{
                fontSize: L.content.title * 0.25,
                lineHeight: 1.25,
                marginTop: "0.6em",
              }}
            >
              <RichText text={body} />
            </div>
          ) : null}
          {source ? (
            <div
              style={{
                fontSize: L.content.title * L.content.source,
                lineHeight: 1.2,
                marginTop: "2.27em",
              }}
            >
              {source}
            </div>
          ) : null}
        </div>
      </FitBox>

      <div style={line(wm.x - wm.gap - wm.lineW)} />
      <Wordmark x={wm.x} y={wm.y} width={wm.w} />
      <div style={line(wm.x + wm.w + wm.gap)} />

      {L.footer.arial ? (
        <>
          <ArialText baseline={L.footer.baseline} size={L.footer.tagline} left={L.footer.left}>
            {TAGLINE}
          </ArialText>
          <ArialText baseline={L.footer.baseline} size={L.footer.handle} left={L.footer.arial.handleLeft}>
            {HANDLE}
          </ArialText>
        </>
      ) : (
        <>
          <BaselineText
            baseline={L.footer.baseline}
            size={L.footer.tagline}
            left={L.footer.left}
            color={kkColors.ink}
          >
            {TAGLINE}
          </BaselineText>
          <BaselineText
            baseline={L.footer.baseline}
            size={L.footer.handle}
            right={L.footer.right}
            color={kkColors.ink}
          >
            {HANDLE}
          </BaselineText>
        </>
      )}
    </AbsoluteFill>
  );
};

/** Template "Public Notice Post": square, 2000×2000. */
export const NOTICE_POST_SIZE = POST.size;
export const NoticePost: React.FC<NoticeProps> = (p) => (
  <Notice {...p} layout={POST} />
);

/** Template "Public Notice Story": vertical, 1125×2000 (the user's vertical template). */
export const NOTICE_STORY_SIZE = STORY.size;
export const NoticeStory: React.FC<NoticeProps> = (p) => (
  <Notice {...p} layout={STORY} />
);
