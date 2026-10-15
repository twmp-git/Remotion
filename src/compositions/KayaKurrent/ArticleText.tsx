import React from "react";
import { kkColors, kkFonts } from "./brand";
import { RichText } from "./RichText";
import type { KKStory } from "./schema";

/**
 * Byline, bold lede and body paragraphs, as laid out in the square template.
 * All spacing is in `em`, so it scales with the size FitBox picks.
 */
export const ArticleText: React.FC<{ story: KKStory }> = ({ story }) => {
  return (
    <div style={{ fontFamily: kkFonts.body, color: kkColors.ink }}>
      <div style={{ fontWeight: 300, lineHeight: 1 }}>{story.byline}</div>
      <p style={{ margin: 0, fontWeight: 700, lineHeight: 1.09 }}>
        <RichText text={story.lede} />
      </p>
      {story.body.map((paragraph, i) => (
        <p
          key={i}
          style={{
            margin: `${i === 0 ? 1.09 : 1.215}em 0 0`,
            fontWeight: 300,
            lineHeight: 1.27,
            textWrap: "pretty",
          }}
        >
          <RichText text={paragraph} />
        </p>
      ))}
    </div>
  );
};

/** The condensed headline. */
export const headlineContentStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: kkFonts.headline,
  fontWeight: 700,
  lineHeight: 0.897,
  color: kkColors.ink,
  // Rajdhani's bold is a touch lighter than the template's headline face; a thin stroke matches it.
  WebkitTextStroke: `0.024em ${kkColors.ink}`,
  textWrap: "pretty",
};
