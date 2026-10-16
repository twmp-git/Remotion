import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { z } from "zod";
import { DM_SANS_OPSZ, HANDLE, kkColors, kkFonts, TAGLINE } from "./brand";
import { FitBox } from "./FitBox";
import { Logo, Wordmark } from "./parts";

export const coverSchema = z.object({
  /** Same headline as the news story (set in capitals). "\n" chooses where it breaks. */
  headline: z.string(),
  /** Optional different breaks for the narrower vertical panel. */
  storyHeadline: z.string().optional(),
  /** Photo in public/ (e.g. "kaya-kurrent/photos/x.jpg"). */
  photo: z.string(),
  /** CSS object-position, e.g. "50% 30%". */
  photoPosition: z.string().optional(),
  /** Optional different photo / crop for the vertical version. */
  storyPhoto: z.string().optional(),
  storyPhotoPosition: z.string().optional(),
});
export type CoverProps = z.infer<typeof coverSchema>;
export type CoverEntry = CoverProps & { slug: string };

const WATERMARK = "#121212";

type Box = { x: number; y: number; w: number; h: number };
type WordmarkLayout = {
  x: number;
  y: number;
  w: number;
  lineY: number;
  lineW: number;
  gap: number;
  thick: number;
};

const Photo: React.FC<{
  src: string;
  position?: string;
  box: Box;
  clipPath?: string;
}> = ({ src, position, box, clipPath }) => (
  <Img
    src={staticFile(src)}
    style={{
      position: "absolute",
      left: box.x,
      top: box.y,
      width: box.w,
      height: box.h,
      objectFit: "cover",
      objectPosition: position ?? "50% 50%",
      clipPath,
    }}
  />
);

const Headline: React.FC<{
  text: string;
  box: Box;
  max: number;
  min: number;
  lineHeight: number;
}> = ({ text, box, max, min, lineHeight }) => (
  <FitBox
    style={{
      left: box.x,
      top: box.y,
      width: box.w,
      height: box.h,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
    contentStyle={{
      fontFamily: kkFonts.headline,
      lineHeight,
      textTransform: "uppercase",
      textAlign: "center",
      textWrap: "balance",
      color: kkColors.white,
    }}
    max={max}
    min={min}
    fitKey={text}
  >
    {/* Chosen breaks ("\n") are kept: each line stays whole and the size shrinks to fit. */}
    {text.split("\n").map((line, i, lines) => (
      <div
        key={i}
        style={
          lines.length > 1 ? { whiteSpace: "nowrap" } : { textWrap: "balance" }
        }
      >
        {line}
      </div>
    ))}
  </FitBox>
);

const WordmarkRule: React.FC<{ wm: WordmarkLayout }> = ({ wm }) => {
  const line = (left: number): React.CSSProperties => ({
    position: "absolute",
    left,
    top: wm.lineY - wm.thick / 2,
    width: wm.lineW,
    height: wm.thick,
    backgroundColor: kkColors.white,
  });
  return (
    <>
      <div style={line(wm.x - wm.gap - wm.lineW)} />
      <Wordmark x={wm.x} y={wm.y} width={wm.w} color="white" />
      <div style={line(wm.x + wm.w + wm.gap)} />
    </>
  );
};

// ---------------------------------------------------------------------------------------------
// Square, 1500×1500 — measured from the user's "Photography Emerging as Source of Income for
// Youth" cover. Same frame, logo, headline size and footer as the News Post it goes with.
const POST = {
  photo: { x: 69, y: 84, w: 1363, h: 1248 },
  notch: { w: 256, h: 311 },
  panel: { x: 120, y: 1009, w: 1262, h: 371 },
  headline: { x: 200, y: 1052, w: 1101, h: 210 },
  wordmark: {
    x: 636.5,
    y: 1276.5,
    w: 228,
    lineY: 1303.5,
    lineW: 124,
    gap: 37,
    thick: 2.5,
  },
};

/** Template "Cover Post": square, 1500×1500 — photo + headline slide that goes before the News Post. */
export const COVER_POST_SIZE = { width: 1500, height: 1500 } as const;
export const CoverPost: React.FC<CoverProps> = ({
  headline,
  photo,
  photoPosition,
}) => {
  const P = POST.panel;
  return (
    <AbsoluteFill style={{ backgroundColor: kkColors.white }}>
      <Photo src={photo} position={photoPosition} box={POST.photo} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: POST.notch.w,
          height: POST.notch.h,
          backgroundColor: kkColors.white,
        }}
      />
      <Logo x={80} y={95} height={180} />

      {/* Black panel with the faint "k" (the Breaking News panel at 0.75 scale). */}
      <div
        style={{
          position: "absolute",
          left: P.x,
          top: P.y,
          width: P.w,
          height: P.h,
          backgroundColor: kkColors.ink,
          overflow: "hidden",
        }}
      >
        <Img
          src={staticFile("kaya-kurrent/breaking-post-panel.png")}
          style={{
            position: "absolute",
            left: -23 - P.x,
            top: 979 - P.y,
            width: 2000 * 0.75,
            height: 713 * 0.75,
          }}
        />
      </div>
      <Headline
        text={headline}
        box={POST.headline}
        max={74.3}
        min={50}
        lineHeight={1}
      />
      <WordmarkRule wm={POST.wordmark} />

      <div
        style={{
          position: "absolute",
          left: 68,
          right: 68,
          top: 1417,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: kkFonts.body,
          fontVariationSettings: DM_SANS_OPSZ,
          fontWeight: 400,
          fontSize: 34.6,
          lineHeight: 1,
          color: kkColors.ink,
        }}
      >
        <span>{TAGLINE}</span>
        <span>{HANDLE}</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------
// Vertical, 1125×2000 — measured from the user's "Same Old United, New Problems" cover.
// cover-story-bg.png is that template (frame + black shapes + tagline) with logo and handle removed.
const STORY = {
  // Inside the frame's black stroke; the top-left notch is cut out.
  photo: { x: 110, y: 91, w: 893, h: 1615 },
  notch: { w: 337 - 110, h: 376 - 91 },
  panel: { x: 148, y: 1255, w: 818, h: 515 },
  headline: { x: 206, y: 1343, w: 701, h: 240 },
  wordmark: {
    x: 556.5 - 237 / 2,
    y: 1600.5,
    w: 237,
    lineY: 1628.5,
    lineW: 129,
    gap: 38,
    thick: 2.5,
  },
};

/** The vertical panel's "k": stem, crossbar and chevron (page coordinates, clipped by the panel). */
const STORY_WATERMARK = [
  "M 354 1440 H 542 V 1800 H 354 Z",
  "M 251 1485 H 354 V 1584 H 251 Z",
  "M 803 1450 L 985 1644 L 812 1800 L 747 1800 L 823 1733 L 698 1600 L 542 1743 L 542 1681 Z",
];

/** Template "Cover Story": vertical, 1125×2000 — photo + headline slide that goes before the News Story. */
export const COVER_STORY_SIZE = { width: 1125, height: 2000 } as const;
export const CoverStory: React.FC<CoverProps> = ({
  headline,
  storyHeadline,
  photo,
  photoPosition,
  storyPhoto,
  storyPhotoPosition,
}) => {
  const P = STORY.panel;
  const { w, h } = STORY.photo;
  const n = STORY.notch;
  return (
    <AbsoluteFill style={{ backgroundColor: kkColors.white }}>
      <Img
        src={staticFile("kaya-kurrent/cover-story-bg.png")}
        style={{ width: "100%", height: "100%" }}
      />
      <Photo
        src={storyPhoto ?? photo}
        position={
          storyPhoto
            ? storyPhotoPosition
            : (storyPhotoPosition ?? photoPosition)
        }
        box={STORY.photo}
        clipPath={`polygon(${n.w}px 0, ${w}px 0, ${w}px ${h}px, 0 ${h}px, 0 ${n.h}px, ${n.w}px ${n.h}px)`}
      />
      <Logo x={107} y={88} height={188} />

      <div
        style={{
          position: "absolute",
          left: P.x,
          top: P.y,
          width: P.w,
          height: P.h,
          backgroundColor: kkColors.ink,
          overflow: "hidden",
        }}
      >
        <svg
          width={P.w}
          height={P.h}
          viewBox={`${P.x} ${P.y} ${P.w} ${P.h}`}
          style={{ position: "absolute", inset: 0 }}
        >
          {STORY_WATERMARK.map((d) => (
            <path key={d} d={d} fill={WATERMARK} />
          ))}
        </svg>
      </div>
      <Headline
        text={storyHeadline ?? headline}
        box={STORY.headline}
        max={83}
        min={56}
        lineHeight={0.99}
      />
      <WordmarkRule wm={STORY.wordmark} />

      <div
        style={{
          position: "absolute",
          left: 697,
          top: 1853,
          fontFamily: kkFonts.storyFooter,
          fontWeight: 400,
          fontSize: 41.7,
          lineHeight: 1,
          color: kkColors.white,
          whiteSpace: "nowrap",
        }}
      >
        {HANDLE}
      </div>
    </AbsoluteFill>
  );
};
