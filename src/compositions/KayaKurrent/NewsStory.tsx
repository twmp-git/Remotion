import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { ArticleText, headlineContentStyle } from "./ArticleText";
import { HANDLE, kkColors, kkFonts } from "./brand";
import { FitBox } from "./FitBox";
import type { KKStory } from "./schema";

/** Vertical story / status, 1080×1920 — the black-and-white frame template. */
export const STORY_SIZE = { width: 1080, height: 1920 } as const;

/**
 * The background is the supplied template (logo, frame, shapes, tagline), cleaned up,
 * with its handle removed so HANDLE from brand.ts is drawn instead.
 * Inside the frame: x 105–964, y 86–1638; the headline box is x 323–964, y 86–355.
 */
export const NewsStory: React.FC<KKStory> = (story) => {
  return (
    <AbsoluteFill style={{ backgroundColor: kkColors.white }}>
      <Img
        src={staticFile("kaya-kurrent/story-template.png")}
        style={{ width: "100%", height: "100%" }}
      />

      <FitBox
        style={{
          left: 364,
          top: 104,
          width: 556,
          height: 236,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
        contentStyle={headlineContentStyle}
        max={72}
        min={42}
        fitKey={story.headline}
      >
        {story.headline}
      </FitBox>

      <FitBox
        style={{ left: 167, top: 396, width: 735, height: 1190 }}
        max={56}
        min={22}
        fitKey={JSON.stringify([story.byline, story.lede, story.body])}
      >
        <ArticleText story={story} />
      </FitBox>

      <div
        style={{
          position: "absolute",
          left: 678,
          top: 1780,
          fontFamily: kkFonts.storyFooter,
          fontWeight: 400,
          fontSize: 38,
          lineHeight: 1,
          color: kkColors.white,
        }}
      >
        {HANDLE}
      </div>
    </AbsoluteFill>
  );
};
