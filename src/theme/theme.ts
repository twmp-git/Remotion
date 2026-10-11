import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fonts are self-hosted in public/fonts (SIL Open Font License), so renders are
// deterministic and work offline. Remotion waits for loadFont() before rendering.
// Both files are variable fonts, so one file covers every weight in the range.
const FONT_FILES = [
  { family: "Space Grotesk", file: "fonts/SpaceGrotesk-Variable.woff2", weight: "300 700" },
  { family: "Inter", file: "fonts/Inter-Variable.woff2", weight: "100 900" },
];

for (const font of FONT_FILES) {
  loadFont({
    family: font.family,
    url: staticFile(font.file),
    weight: font.weight,
    format: "woff2",
  }).catch((err) => {
    console.error(`Failed to load font ${font.family}`, err);
  });
}

export const fonts = {
  display: "'Space Grotesk', sans-serif",
  body: "Inter, sans-serif",
} as const;

export const colors = {
  background: "#0B0D17",
  backgroundAlt: "#151A36",
  text: "#F5F7FF",
  muted: "#9AA3C7",
  primary: "#6C63FF",
  accent: "#00D4B4",
  warm: "#FF6B8B",
  yellow: "#FFC857",
} as const;

export type ColorName = keyof typeof colors;
