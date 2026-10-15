import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/** Footer text on both formats. */
export const HANDLE = "@kayakurrent";
export const TAGLINE = "News now, for then.";

export const kkColors = {
  ink: "#000000",
  /** Warm off-white sampled from the square post's background. */
  paper: "#F5F3F1",
  white: "#FFFFFF",
} as const;

export const kkFonts = {
  /** Condensed headline face (closest open-licence match to the template). */
  headline: "Rajdhani, 'Arial Narrow', sans-serif",
  /** Byline, lede, body and the square post's footer. */
  body: "'DM Sans', Arial, sans-serif",
  /** The story template's footer is set in Arial; Arimo has identical metrics. */
  storyFooter: "Arimo, Arial, Helvetica, sans-serif",
} as const;

// Self-hosted (SIL Open Font License) in public/fonts, so renders work offline.
// Latin-ext is loaded too so Chichewa letters such as ŵ render in the same face.
const LATIN =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const LATIN_EXT =
  "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";

const SUBSET_FACES = [
  { family: "Rajdhani", weight: "700", file: "Rajdhani-Bold" },
  { family: "DM Sans", weight: "300", file: "DMSans-Light" },
  { family: "DM Sans", weight: "400", file: "DMSans-Regular" },
  { family: "DM Sans", weight: "700", file: "DMSans-Bold" },
];

/** Resolves once every face is ready; text fitting waits for this before measuring. */
export const kkFontsReady: Promise<unknown> = Promise.all([
  ...SUBSET_FACES.flatMap((f) => [
    loadFont({
      family: f.family,
      weight: f.weight,
      url: staticFile(`fonts/${f.file}-latin.woff2`),
      format: "woff2",
      unicodeRange: LATIN,
    }),
    loadFont({
      family: f.family,
      weight: f.weight,
      url: staticFile(`fonts/${f.file}-latin-ext.woff2`),
      format: "woff2",
      unicodeRange: LATIN_EXT,
    }),
  ]),
  loadFont({
    family: "Arimo",
    weight: "400",
    url: staticFile("fonts/Arimo-Regular-latin.woff2"),
    format: "woff2",
  }),
]).catch((err) => {
  console.error("Failed to load Kaya Kurrent fonts", err);
});
