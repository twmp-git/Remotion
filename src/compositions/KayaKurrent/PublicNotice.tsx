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
  title: z.string(),
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
  };
};

// Square: measured from the user's "MERA ADJUSTS FUEL PUMP PRICES" template (2000×2000).
const POST: Layout = {
  size: { width: 2000, height: 2000 },
  split: 1562,
  panel: { x: 91, y: 567, w: 1817, h: 1110, r: 190 },
  logo: { x: 48, y: 127, h: 240 },
  kicker: { right: 2000 - 1890, top: 190, size: 120 },
  content: { x: 258, y: 677, w: 1400, h: 743, title: 169 },
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

// Vertical: designed to match the square (no reference was supplied).
const STORY: Layout = {
  size: { width: 1125, height: 2000 },
  split: 1500,
  panel: { x: 56, y: 430, w: 1013, h: 1200, r: 120 },
  logo: { x: 62, y: 110, h: 170 },
  kicker: { right: 1125 - 1066, top: 150, size: 84 },
  content: { x: 128, y: 500, w: 880, h: 930, title: 160, center: true },
  wordmark: {
    x: 457,
    y: 1525,
    w: 211,
    lineY: 1549,
    lineW: 115,
    gap: 32,
    thick: 3,
  },
  footer: { baseline: 1840, tagline: 34, handle: 38, left: 70, right: 70 },
};

const Notice: React.FC<NoticeProps & { layout: Layout }> = ({
  kicker,
  title,
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
        fitKey={JSON.stringify([title, items, body, source])}
      >
        <div
          style={{
            fontFamily: kkFonts.headline,
            lineHeight: 1.065,
            letterSpacing: "-0.025em",
            textTransform: "uppercase",
          }}
        >
          {title}
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
                fontSize: "0.4325em",
                lineHeight: 0.97,
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
                fontSize: "0.25em",
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
                fontSize: "0.193em",
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
    </AbsoluteFill>
  );
};

/** Template "Public Notice Post": square, 2000×2000. */
export const NOTICE_POST_SIZE = POST.size;
export const NoticePost: React.FC<NoticeProps> = (p) => (
  <Notice {...p} layout={POST} />
);

/** Template "Public Notice Story": vertical, 1125×2000 (designed to match the square). */
export const NOTICE_STORY_SIZE = STORY.size;
export const NoticeStory: React.FC<NoticeProps> = (p) => (
  <Notice {...p} layout={STORY} />
);
