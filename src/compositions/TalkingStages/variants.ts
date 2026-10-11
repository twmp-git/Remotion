import type { HandStyle } from "./illustration/Hand";

export type PhoneKind = "retro-bar";

export type Variant = {
  id: string;
  /** Background paper colour. */
  background: string;
  phone: PhoneKind;
  caseColor: string;
  hand: HandStyle;
  lyrics: { text: string; hot: string; shadow: string };
  sparkle: string;
};

/** 1 — Early 2000s: candy-pink case, glitter almond nails. */
export const NOKIA_ERA: Variant = {
  id: "nokia",
  background: "#F59A92",
  phone: "retro-bar",
  caseColor: "#FF2FA4",
  hand: {
    id: "hand-nokia",
    skin: "#C27A4A",
    skinShadow: "#94552F",
    skinLight: "#DE9A68",
    nails: {
      shape: "almond",
      length: 128,
      base: "#2A1E2E",
      chrome: ["#2B1F35", "#4A2A55"],
      glitter: ["#FF7AD9", "#7CF4FF", "#FFE066", "#B69CFF", "#FFFFFF"],
      gems: "#FFFFFF",
    },
    rings: [{ finger: 1, metal: "gold" }],
  },
  lyrics: { text: "#FFF6EC", hot: "#D7FF3C", shadow: "#C2186E" },
  sparkle: "#FFFFFF",
};
