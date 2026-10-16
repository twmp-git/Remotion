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
  /** The template's headline face (supplied). It only covers basic ASCII, so Rajdhani fills in accents. */
  headline: "'d Diam', Rajdhani, 'Arial Narrow', sans-serif",
  /** Byline, lede, body and the square post's footer (supplied variable font). */
  body: "'DM Sans', Arial, sans-serif",
  /** The story template's footer is set in Arial; Arimo has identical metrics. */
  storyFooter: "Arimo, Arial, Helvetica, sans-serif",
} as const;

/**
 * DM Sans has an optical-size axis. The template matches opsz 14 (DM Sans' default
 * static cut) at every size, so pin it rather than letting the browser pick by font size.
 */
export const DM_SANS_OPSZ = "'opsz' 14";

// Self-hosted in public/fonts, so renders work offline.
const RAJDHANI_LATIN =
  "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const RAJDHANI_LATIN_EXT =
  "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";

/** Resolves once every face is ready; text fitting waits for this before measuring. */
export const kkFontsReady: Promise<unknown> = Promise.all([
  loadFont({
    family: "d Diam",
    weight: "400",
    url: staticFile("fonts/dDiam-Regular.ttf"),
    format: "truetype",
  }),
  loadFont({
    family: "DM Sans",
    weight: "100 1000",
    url: staticFile("fonts/DMSans-VariableFont_opszwght.ttf"),
    format: "truetype",
  }),
  loadFont({
    family: "Rajdhani",
    weight: "700",
    url: staticFile("fonts/Rajdhani-Bold-latin.woff2"),
    format: "woff2",
    unicodeRange: RAJDHANI_LATIN,
  }),
  loadFont({
    family: "Rajdhani",
    weight: "700",
    url: staticFile("fonts/Rajdhani-Bold-latin-ext.woff2"),
    format: "woff2",
    unicodeRange: RAJDHANI_LATIN_EXT,
  }),
  loadFont({
    family: "Arimo",
    weight: "400",
    url: staticFile("fonts/Arimo-Regular-latin.woff2"),
    format: "woff2",
  }),
]).catch((err) => {
  console.error("Failed to load Kaya Kurrent fonts", err);
});
