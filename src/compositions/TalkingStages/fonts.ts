import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Self-hosted (SIL Open Font License) so renders work offline.
const FILES = [
  { family: "Anton", file: "fonts/Anton-Regular.woff2" },
  { family: "VT323", file: "fonts/VT323-Regular.woff2" },
  { family: "Patrick Hand", file: "fonts/PatrickHand-Regular.woff2" },
];

for (const f of FILES) {
  loadFont({ family: f.family, url: staticFile(f.file), format: "woff2" }).catch((err) =>
    console.error(`Failed to load ${f.family}`, err),
  );
}

export const tsFonts = {
  /** Big lyric stickers. */
  lyric: "Anton, Impact, sans-serif",
  /** Old LCD screens. */
  pixel: "VT323, monospace",
  /** Hand-lettered keypad labels. */
  hand: "'Patrick Hand', cursive",
} as const;
