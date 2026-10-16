import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { ArticleText, headlineContentStyle } from "./ArticleText";
import { DM_SANS_OPSZ, HANDLE, kkColors, kkFonts, TAGLINE } from "./brand";
import { FitBox } from "./FitBox";
import type { KKStory } from "./schema";

/** Square feed post, 1500×1500 — matches the "IMF, Malawi Near Economic Support Deal" template. */
export const POST_SIZE = { width: 1500, height: 1500 } as const;

// Frame outline (stroke centre-lines, px), measured from the template.
const FRAME = { left: 71, notchX: 257, top: 84, notchY: 311, right: 1432, bottom: 1329 };
const STROKE = 3;

export const NewsPost: React.FC<KKStory> = (story) => {
  const { left, notchX, top, notchY, right, bottom } = FRAME;
  return (
    <AbsoluteFill style={{ backgroundColor: kkColors.paper }}>
      {story.photo ? (
        <>
          <Img
            src={staticFile(story.photo)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Heavy paper-coloured wash so the photo only shows through faintly, as in the template. */}
          <AbsoluteFill style={{ backgroundColor: "rgba(245, 243, 241, 0.88)" }} />
        </>
      ) : null}

      <svg
        width={POST_SIZE.width}
        height={POST_SIZE.height}
        style={{ position: "absolute", inset: 0 }}
      >
        <path
          d={`M ${notchX} ${top} H ${right} V ${bottom} H ${left} V ${notchY} H ${notchX} Z`}
          fill="none"
          stroke={kkColors.ink}
          strokeWidth={STROKE}
        />
      </svg>

      <Img
        src={staticFile("kaya-kurrent/logo-k.png")}
        style={{ position: "absolute", left: 74, top: 89, width: 154, height: 192 }}
      />

      <FitBox
        style={{
          left: 346,
          top: 98,
          width: 1020,
          height: 194,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
        contentStyle={headlineContentStyle}
        max={74.3}
        min={48}
        fitKey={story.headline}
      >
        {story.headline}
      </FitBox>

      <FitBox
        style={{ left: 151, top: 372, width: 1201, height: 900 }}
        max={60}
        min={24}
        fitKey={JSON.stringify([story.byline, story.lede, story.body])}
      >
        <ArticleText story={story} />
      </FitBox>

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
