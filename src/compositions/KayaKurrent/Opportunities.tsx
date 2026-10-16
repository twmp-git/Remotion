import React, { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, Img, staticFile, useDelayRender } from "remotion";
import { z } from "zod";
import {
  DM_SANS_OPSZ,
  HANDLE,
  kkColors,
  kkFonts,
  kkFontsReady,
  TAGLINE,
} from "./brand";
import { BaselineText, Logo, Wordmark } from "./parts";
import { RichText } from "./RichText";

export const OPPORTUNITY_YELLOW = "#CCB720";

export const opportunitySchema = z.object({
  /** Label at the top right, default "//OPPORTUNITIES". */
  kicker: z.string().optional(),
  /** Use "\n" to choose where the title breaks (keep names/phrases together). */
  title: z.string(),
  /** Optional title with different breaks for the narrower vertical card. */
  storyTitle: z.string().optional(),
  /** Rows such as "**Who it's for:**  Designers across Africa" (** = bold). */
  rows: z.array(z.string()),
  /** Photo in public/ shown behind the card (sharp; the user doesn't want it blurred). */
  photo: z.string(),
  /** Optional different photo/crop for the vertical version. */
  storyPhoto: z.string().optional(),
  photoPosition: z.string().optional(),
  /** Optional blur in px at the square's scale (default none). */
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
  /**
   * Text area inside the card (above the wordmark). The title takes the largest size that
   * keeps it within `lines` lines; rows are a fixed size so every post reads the same.
   */
  content: {
    x: number;
    y: number;
    w: number;
    h: number;
    title: { max: number; min: number; lines: number };
    rows: { size: number; min: number };
    rule: { w: number; thick: number };
    /** Put each row's bold label on its own line (narrow vertical card). */
    stackLabels?: boolean;
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
  content: {
    x: 273,
    y: 620,
    w: 951,
    h: 540,
    title: { max: 82, min: 54, lines: 2 },
    rows: { size: 38, min: 30 },
    rule: { w: 96, thick: 3 },
  },
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
  card: { x: 60, y: 610, w: 1005, h: 1120, r: 120 },
  logo: { x: 70, y: 110, h: 170 },
  kicker: { right: 70, top: 132, size: 78 },
  content: {
    x: 155,
    y: 680,
    w: 815,
    h: 840,
    title: { max: 104, min: 64, lines: 4 },
    rows: { size: 47, min: 34 },
    rule: { w: 110, thick: 3.5 },
    stackLabels: true,
  },
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

/**
 * Title, rule and rows, centred as a group in the card. The title is sized by line count
 * (largest size that fits `lines` lines, one more only if it must); rows stay at their fixed
 * size unless the whole group would overflow.
 */
const CardText: React.FC<{
  title: string;
  rows: string[];
  layout: Layout["content"];
}> = ({ title, rows, layout: C }) => {
  const groupRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const pending = useRef<number[]>([]);
  const [fit, setFit] = useState({
    title: C.title.max,
    rows: C.rows.size,
    overflows: false,
    run: 0,
  });
  const { delayRender, continueRender } = useDelayRender();
  const fitKey = JSON.stringify([title, rows, C]);

  useLayoutEffect(() => {
    pending.current.push(delayRender("Fitting opportunity text"));
    let cancelled = false;
    kkFontsReady.then(() => {
      const group = groupRef.current;
      const t = titleRef.current;
      const r = rowsRef.current;
      if (cancelled || !group || !t || !r) {
        return;
      }
      const lineCount = (size: number) => {
        t.style.fontSize = `${size}px`;
        let n = 0;
        for (const el of Array.from(t.children) as HTMLElement[]) {
          n += Math.round(el.offsetHeight / (size * TITLE_LH));
        }
        return n;
      };
      const wordsFit = () => t.scrollWidth <= t.clientWidth + 0.5;
      const step = 0.5;
      const titleFor = (lines: number) => {
        for (let s = C.title.max; s >= C.title.min; s -= step) {
          if (lineCount(s) <= lines && wordsFit()) return s;
        }
        return null;
      };
      // Deliberate breaks ("\n") are the lines: each part stays on one line if it can.
      const maxLines =
        t.children.length > 1 ? t.children.length : C.title.lines;
      let titleSize =
        titleFor(maxLines) ?? titleFor(maxLines + 1) ?? C.title.min;
      let rowSize = C.rows.size;
      const fits = () => {
        t.style.fontSize = `${titleSize}px`;
        r.style.fontSize = `${rowSize}px`;
        return group.offsetHeight <= C.h && wordsFit();
      };
      // Rows keep their size (readability, same on every post); the title gives way first.
      while (!fits() && titleSize > C.title.min) titleSize -= step;
      while (!fits() && rowSize > C.rows.min) rowSize -= step;
      setFit((prev) => ({
        title: titleSize,
        rows: rowSize,
        overflows: !fits(),
        run: prev.run + 1,
      }));
    });
    return () => {
      cancelled = true;
    };
  }, [fitKey, C, delayRender]);

  useLayoutEffect(() => {
    if (fit.run === 0) return;
    for (const handle of pending.current) continueRender(handle);
    pending.current = [];
  }, [fit, continueRender]);

  return (
    <div
      style={{
        position: "absolute",
        left: C.x,
        top: C.y,
        width: C.w,
        height: C.h,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div ref={groupRef} style={{ color: kkColors.ink, textAlign: "center" }}>
        <div
          ref={titleRef}
          style={{
            fontFamily: kkFonts.headline,
            fontSize: fit.title,
            lineHeight: TITLE_LH,
            textTransform: "uppercase",
          }}
        >
          {title.split("\n").map((part, i) => (
            <div key={i} style={{ textWrap: "balance" }}>
              {part}
            </div>
          ))}
        </div>
        <div style={{ fontSize: fit.rows }}>
          <div
            style={{
              width: C.rule.w,
              height: C.rule.thick,
              margin: "0.85em auto 0.95em",
              backgroundColor: kkColors.ink,
            }}
          />
          <div
            ref={rowsRef}
            style={{
              fontFamily: kkFonts.body,
              fontVariationSettings: DM_SANS_OPSZ,
              fontWeight: 250,
              lineHeight: 1.12,
              maxWidth: "22em",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {rows.map((row, i) => {
              const label = C.stackLabels
                ? /^(\*\*[^*]+\*\*)\s+([\s\S]*)$/.exec(row)
                : null;
              return (
                <div
                  key={i}
                  style={{
                    marginTop: i === 0 ? 0 : C.stackLabels ? "0.85em" : "0.7em",
                    whiteSpace: "pre-wrap",
                    textWrap: "balance",
                  }}
                >
                  {label ? (
                    <>
                      <div>
                        <RichText text={label[1]} />
                      </div>
                      <RichText text={label[2]} />
                    </>
                  ) : (
                    <RichText text={row} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {fit.overflows ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: "8px 12px",
            background: "#E00000",
            color: "#FFFFFF",
            font: "700 24px Arial, sans-serif",
            textAlign: "center",
          }}
        >
          TEXT TOO LONG — trim the text
        </div>
      ) : null}
    </div>
  );
};

const TITLE_LH = 0.963;

const Opportunity: React.FC<OpportunityProps & { layout: Layout }> = ({
  kicker,
  title,
  storyTitle,
  rows,
  photo,
  storyPhoto,
  photoPosition,
  photoBlur,
  layout: L,
}) => {
  const vertical = L.size.height > L.size.width;
  const wm = L.wordmark;
  // The AU reference strip is a low-res crop of an already-blurred photo, so it keeps a blur.
  const blur =
    (vertical && storyPhoto && photoBlur === 0 ? 14 : (photoBlur ?? 0)) *
    L.scale;
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

      <CardText
        title={vertical && storyTitle ? storyTitle : title}
        rows={rows}
        layout={L.content}
      />

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
