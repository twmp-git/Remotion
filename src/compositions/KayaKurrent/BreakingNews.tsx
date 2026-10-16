import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { z } from "zod";
import { DM_SANS_OPSZ, HANDLE, kkColors, kkFonts, TAGLINE } from "./brand";
import { FitBox } from "./FitBox";
import { BaselineText, KK_RED, Logo } from "./parts";

export const breakingSchema = z.object({
  headline: z.string(),
  /** Optional small line under the headline. */
  subline: z.string().optional(),
  /** Photo in public/ (e.g. "kaya-kurrent/photos/speaker.jpg"). */
  photo: z.string(),
  /** Optional different crop for the vertical version. */
  storyPhoto: z.string().optional(),
  /** CSS object-position for the photo, e.g. "70% 30%". */
  photoPosition: z.string().optional(),
});
export type BreakingProps = z.infer<typeof breakingSchema>;
export type BreakingEntry = BreakingProps & { slug: string };

type Layout = {
  size: { width: number; height: number };
  photo: { x: number; y: number; w: number; h: number };
  logoBox: { w: number; h: number };
  logo: { x: number; y: number; h: number };
  panel: { top: number; src: string };
  tab: {
    x: number;
    y: number;
    h: number;
    red: number;
    light: number;
    font: number;
    padRed: number;
    padLight: number;
  };
  headline: {
    x: number;
    y: number;
    w: number;
    h: number;
    font: number;
    lineHeight: number;
  };
  footer: {
    tagline?: { size: number; left: number };
    handle: { size: number; right: number };
    baseline: number;
  };
};

// Measured from the user's templates (vertical 1125×2000, square 2000×2000).
const STORY: Layout = {
  size: { width: 1125, height: 2000 },
  photo: { x: 87, y: 83, w: 951, h: 1043 },
  logoBox: { w: 185, h: 243 },
  logo: { x: 108, y: 105, h: 162 },
  panel: { top: 1126, src: "kaya-kurrent/breaking-story-panel.png" },
  tab: {
    x: 250,
    y: 1086,
    h: 64,
    red: 297,
    light: 295,
    font: 52,
    padRed: 60,
    padLight: 50,
  },
  headline: { x: 104, y: 1347, w: 820, h: 330, font: 54, lineHeight: 0.89 },
  footer: { handle: { size: 28.4, right: 1125 - 1030 }, baseline: 1748 },
};

const POST: Layout = {
  size: { width: 2000, height: 2000 },
  photo: { x: 101, y: 90, w: 1798, h: 1197 },
  logoBox: { w: 240, h: 325 },
  logo: { x: 106, y: 117, h: 240 },
  panel: { top: 1287, src: "kaya-kurrent/breaking-post-panel.png" },
  tab: {
    x: 579,
    y: 1229,
    h: 91,
    red: 421,
    light: 421,
    font: 74,
    padRed: 84,
    padLight: 73,
  },
  headline: { x: 170, y: 1447, w: 1200, h: 350, font: 69, lineHeight: 0.865 },
  footer: {
    tagline: { size: 45.7, left: 94 },
    handle: { size: 36.5, right: 2000 - 1823 },
    baseline: 1877,
  },
};

const Breaking: React.FC<
  BreakingProps & { layout: Layout; vertical: boolean }
> = ({
  headline,
  subline,
  photo,
  storyPhoto,
  photoPosition,
  layout: L,
  vertical,
}) => {
  const tabText: React.CSSProperties = {
    position: "absolute",
    top: 0,
    height: L.tab.h,
    fontFamily: kkFonts.storyFooter,
    fontSize: L.tab.font,
    lineHeight: `${L.tab.h}px`,
    whiteSpace: "nowrap",
    overflow: "hidden",
  };
  return (
    <AbsoluteFill style={{ backgroundColor: kkColors.white }}>
      <Img
        src={staticFile(vertical && storyPhoto ? storyPhoto : photo)}
        style={{
          position: "absolute",
          left: L.photo.x,
          top: L.photo.y,
          width: L.photo.w,
          height: L.photo.h,
          objectFit: "cover",
          objectPosition: photoPosition ?? "50% 50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: L.photo.x,
          top: L.photo.y,
          width: L.logoBox.w,
          height: L.logoBox.h,
          backgroundColor: kkColors.white,
        }}
      />
      <Logo x={L.logo.x} y={L.logo.y} height={L.logo.h} />

      <Img
        src={staticFile(L.panel.src)}
        style={{
          position: "absolute",
          left: 0,
          top: L.panel.top,
          width: L.size.width,
        }}
      />

      {/* "Breaking | News" tab */}
      <div
        style={{
          position: "absolute",
          left: L.tab.x,
          top: L.tab.y,
          width: L.tab.red + L.tab.light,
          height: L.tab.h,
        }}
      >
        <div
          style={{
            ...tabText,
            left: 0,
            width: L.tab.red,
            backgroundColor: KK_RED,
            color: kkColors.white,
            paddingLeft: L.tab.padRed,
            boxSizing: "border-box",
          }}
        >
          Breaking
        </div>
        <div
          style={{
            ...tabText,
            left: L.tab.red,
            width: L.tab.light,
            backgroundColor: "#F5F4F8",
            color: KK_RED,
            paddingLeft: L.tab.padLight,
            boxSizing: "border-box",
          }}
        >
          News
        </div>
      </div>

      <FitBox
        style={{
          left: L.headline.x,
          top: L.headline.y,
          width: L.headline.w,
          height: L.headline.h,
        }}
        contentStyle={{
          fontFamily: kkFonts.body,
          fontVariationSettings: DM_SANS_OPSZ,
          fontWeight: 400,
          color: kkColors.white,
        }}
        max={L.headline.font}
        min={L.headline.font * 0.6}
        fitKey={JSON.stringify([headline, subline])}
      >
        <div style={{ display: "flex" }}>
          <div
            style={{
              width: "0.25em",
              flexShrink: 0,
              margin: "0.1em 0.85em 0.1em 0",
              backgroundColor: kkColors.white,
            }}
          />
          <div style={{ lineHeight: L.headline.lineHeight }}>{headline}</div>
        </div>
        {subline ? (
          <div style={{ paddingLeft: "1.1em", marginTop: "0.75em" }}>
            <div style={{ fontSize: "0.363em", lineHeight: 1.2 }}>
              {subline}
            </div>
          </div>
        ) : null}
      </FitBox>

      {L.footer.tagline ? (
        <BaselineText
          baseline={L.footer.baseline}
          size={L.footer.tagline.size}
          left={L.footer.tagline.left}
          color={kkColors.white}
        >
          {TAGLINE}
        </BaselineText>
      ) : null}
      <BaselineText
        baseline={L.footer.baseline}
        size={L.footer.handle.size}
        right={L.footer.handle.right}
        color={kkColors.white}
      >
        {HANDLE}
      </BaselineText>
    </AbsoluteFill>
  );
};

/** Template "Breaking News Post": square, 2000×2000. */
export const BREAKING_POST_SIZE = POST.size;
export const BreakingPost: React.FC<BreakingProps> = (p) => (
  <Breaking {...p} layout={POST} vertical={false} />
);

/** Template "Breaking News Story": vertical, 1125×2000. */
export const BREAKING_STORY_SIZE = STORY.size;
export const BreakingStory: React.FC<BreakingProps> = (p) => (
  <Breaking {...p} layout={STORY} vertical />
);
