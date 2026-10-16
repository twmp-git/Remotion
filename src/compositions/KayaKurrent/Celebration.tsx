import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { z } from "zod";
import { DM_SANS_OPSZ, kkColors, kkFonts } from "./brand";
import { FitBox } from "./FitBox";
import { Wordmark } from "./parts";

const dateSchema = z.object({ day: z.string(), month: z.string() });

export const celebrationSchema = z.object({
  /** Big greeting on the paper sheet, e.g. "Happy New Year" (set in capitals). */
  message: z.string(),
  /** Text on the sticky note, repeated three times (the year in the template). */
  sticky: z.string(),
  /** Calendar date at the top, e.g. { day: "31", month: "December" }. */
  date: dateSchema,
  /** Second date at the bottom of the vertical version. */
  endDate: dateSchema,
  /** Optional photo for the polaroid (black-and-white like the template works best). */
  photo: z.string().optional(),
  photoPosition: z.string().optional(),
});
export type CelebrationProps = z.infer<typeof celebrationSchema>;
export type CelebrationEntry = CelebrationProps & { slug: string };

type Pt = [number, number];
type Layout = {
  size: { width: number; height: number };
  bg: string;
  date: {
    left: number;
    capTop: number;
    day: number;
    month: number;
    monthLeft: number;
    monthCapTop: number;
  };
  endDate?: {
    left: number;
    capTop: number;
    monthLeft: number;
    monthCapTop: number;
  };
  message: { x: number; y: number; w: number; h: number; size: number };
  /** Shapes that sit on top of the message in the template (it is tucked under them). */
  covers: Pt[][];
  sticky: { cx: number; cy: number; size: number; angle: number };
  polaroid: {
    cx: number;
    cy: number;
    angle: number;
    w: number;
    h: number;
    pin: { head: Pt; r: number; base: Pt; rx: number; ry: number };
  };
  wordmark?: { x: number; y: number; w: number };
};

// Measured from the user's "Happy New Year" calendar templates.
const STORY: Layout = {
  size: { width: 1125, height: 2000 },
  bg: "kaya-kurrent/celebration-story-bg.jpg",
  date: {
    left: 141,
    capTop: 200,
    day: 157,
    month: 78,
    monthLeft: 355,
    monthCapTop: 199,
  },
  endDate: { left: 140, capTop: 1697, monthLeft: 356, monthCapTop: 1697 },
  message: { x: 300, y: 547, w: 520, h: 450, size: 153 },
  covers: [
    [
      [77.5, 479],
      [287.5, 437.5],
      [332.5, 645],
      [119, 692.5],
    ],
  ],
  sticky: { cx: 199, cy: 580, size: 38, angle: -11.2 },
  polaroid: {
    cx: 768,
    cy: 1251.5,
    angle: 16.14,
    w: 358,
    h: 369,
    pin: { head: [826, 1019], r: 14.5, base: [822, 1047], rx: 19, ry: 12 },
  },
};

const POST: Layout = {
  size: { width: 1600, height: 2000 },
  bg: "kaya-kurrent/celebration-post-bg.jpg",
  date: {
    left: 182,
    capTop: 259,
    day: 200,
    month: 100,
    monthLeft: 457,
    monthCapTop: 256,
  },
  message: { x: 434, y: 585, w: 930, h: 790, size: 271 },
  covers: [
    [
      [126, 490],
      [397.5, 435],
      [454, 700],
      [179, 762.5],
    ],
    [
      [1095, 1145],
      [1599, 1291],
      [1446, 1821],
      [943, 1676],
    ],
  ],
  sticky: { cx: 286, cy: 615, size: 48, angle: -11.45 },
  polaroid: {
    cx: 1272,
    cy: 1484.5,
    angle: 16.16,
    w: 458,
    h: 473,
    pin: { head: [1346, 1189], r: 19, base: [1342, 1222], rx: 24.5, ry: 16 },
  },
  wordmark: { x: 223, y: 1830, w: 427 },
};

const black = kkColors.ink;

/** DM Sans Black, placed by the top of its capitals/figures (0.141 em below the line box top). */
const DateText: React.FC<{
  text: string;
  left: number;
  capTop: number;
  size: number;
}> = ({ text, left, capTop, size }) => (
  <div
    style={{
      position: "absolute",
      left,
      top: capTop - 0.141 * size,
      fontFamily: kkFonts.body,
      fontVariationSettings: DM_SANS_OPSZ,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1,
      letterSpacing: "-0.08em",
      color: black,
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);

const Celebration: React.FC<CelebrationProps & { layout: Layout }> = ({
  message,
  sticky,
  date,
  endDate,
  photo,
  photoPosition,
  layout: L,
}) => {
  const m = L.message;
  // Even-odd clip: everything except the sticky note / polaroid, so the message tucks under them.
  const clip = `path(evenodd, "M -5000 -5000 H 5000 V 5000 H -5000 Z ${L.covers
    .map(
      (poly) =>
        `M ${poly.map(([x, y]) => `${x - m.x} ${y - m.y}`).join(" L ")} Z`,
    )
    .join(" ")}")`;
  const P = L.polaroid;
  const pinColor =
    "radial-gradient(circle at 35% 30%, #FF6B6B 0%, #CE0309 45%, #8A0005 100%)";
  return (
    <AbsoluteFill style={{ backgroundColor: "#BE292D" }}>
      <Img src={staticFile(L.bg)} style={{ width: "100%", height: "100%" }} />

      <DateText
        text={date.day}
        left={L.date.left}
        capTop={L.date.capTop}
        size={L.date.day}
      />
      <DateText
        text={date.month}
        left={L.date.monthLeft}
        capTop={L.date.monthCapTop}
        size={L.date.month}
      />
      {L.endDate ? (
        <>
          <DateText
            text={endDate.day}
            left={L.endDate.left}
            capTop={L.endDate.capTop}
            size={L.date.day}
          />
          <DateText
            text={endDate.month}
            left={L.endDate.monthLeft}
            capTop={L.endDate.monthCapTop}
            size={L.date.month}
          />
        </>
      ) : null}

      <FitBox
        style={{ left: m.x, top: m.y, width: m.w, height: m.h, clipPath: clip }}
        contentStyle={{
          fontFamily: kkFonts.headline,
          lineHeight: 0.964,
          letterSpacing: "-0.04em",
          textTransform: "uppercase",
          color: black,
        }}
        max={m.size}
        min={m.size * 0.45}
        fitKey={message}
      >
        {message}
      </FitBox>

      {/* Sticky note text */}
      <div
        style={{
          position: "absolute",
          left: L.sticky.cx,
          top: L.sticky.cy,
          translate: "-50% -50%",
          rotate: `${L.sticky.angle}deg`,
          fontFamily: kkFonts.body,
          fontVariationSettings: DM_SANS_OPSZ,
          fontWeight: 900,
          fontSize: L.sticky.size,
          lineHeight: 0.95,
          letterSpacing: "-0.04em",
          textAlign: "center",
          color: black,
          whiteSpace: "nowrap",
        }}
      >
        {sticky}
        <br />
        {sticky}
        <br />
        {sticky}
      </div>

      {photo ? (
        <>
          <Img
            src={staticFile(photo)}
            style={{
              position: "absolute",
              left: P.cx - P.w / 2,
              top: P.cy - P.h / 2,
              width: P.w,
              height: P.h,
              objectFit: "cover",
              objectPosition: photoPosition ?? "50% 50%",
              rotate: `${P.angle}deg`,
            }}
          />
          {/* Push pin, redrawn on top of the new photo */}
          <div
            style={{
              position: "absolute",
              left: P.pin.base[0] - P.pin.rx,
              top: P.pin.base[1] - P.pin.ry,
              width: P.pin.rx * 2,
              height: P.pin.ry * 2,
              borderRadius: "50%",
              background: pinColor,
              boxShadow: "2px 4px 6px rgba(0,0,0,0.35)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: P.pin.head[0] - P.pin.r,
              top: P.pin.head[1] - P.pin.r,
              width: P.pin.r * 2,
              height: P.pin.r * 2,
              borderRadius: "50%",
              background: pinColor,
            }}
          />
        </>
      ) : null}

      {L.wordmark ? (
        <Wordmark
          x={L.wordmark.x}
          y={L.wordmark.y}
          width={L.wordmark.w}
          color="white"
        />
      ) : null}
    </AbsoluteFill>
  );
};

/** Template "Celebration Post": 4:5, 1600×2000. */
export const CELEBRATION_POST_SIZE = POST.size;
export const CelebrationPost: React.FC<CelebrationProps> = (p) => (
  <Celebration {...p} layout={POST} />
);

/** Template "Celebration Story": vertical, 1125×2000. */
export const CELEBRATION_STORY_SIZE = STORY.size;
export const CelebrationStory: React.FC<CelebrationProps> = (p) => (
  <Celebration {...p} layout={STORY} />
);
