import type { HandStyle } from "./illustration/Hand";

export type PhoneKind = "retro-bar" | "qwerty" | "flip" | "ios" | "android";

export type Variant = {
  id: string;
  /** Background paper colour. */
  background: string;
  phone: PhoneKind;
  caseColor: string;
  hand: HandStyle;
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
      length: 70,
      base: "#2A1E2E",
      chrome: ["#2B1F35", "#4A2A55"],
      glitter: ["#FF7AD9", "#7CF4FF", "#FFE066", "#B69CFF", "#FFFFFF"],
      gems: "#FFFFFF",
    },
    rings: [{ finger: 1, metal: "gold" }],
  },
  sparkle: "#FFFFFF",
};

/** 2 — Late 2000s: a man's hand on a keyboard phone, hoodie sleeve, silver chain bracelet. */
export const QWERTY_ERA: Variant = {
  id: "qwerty",
  background: "#8EC5DB",
  phone: "qwerty",
  caseColor: "#3A3D46",
  hand: {
    id: "hand-qwerty",
    skin: "#6E4026",
    skinShadow: "#4C2916",
    skinLight: "#8E5A38",
    build: 1.12,
    nails: { shape: "short", length: 4, base: "#B98472" },
    bracelet: "silver",
    sleeve: "#1E2235",
  },
  sparkle: "#FFFFFF",
};

/** 3 — Today: a Black woman's hand, chrome coffin nails with French tips + gems, stacked gold rings. */
export const IPHONE_ERA: Variant = {
  id: "iphone",
  background: "#C7B3F0",
  phone: "ios",
  caseColor: "#F2D6E4",
  hand: {
    id: "hand-iphone",
    skin: "#5B321D",
    skinShadow: "#3D1F10",
    skinLight: "#7D4B2E",
    nails: {
      shape: "coffin",
      length: 78,
      base: "#E9E3F5",
      chrome: ["#F7F2FF", "#B9A7E8"],
      tip: "#FFFFFF",
      gems: "#FFD6F0",
    },
    rings: [
      { finger: 1, metal: "gold", stack: true },
      { finger: 2, metal: "gold", stone: "#FF5FA2" },
    ],
    bracelet: "gold",
  },
  sparkle: "#FFFFFF",
};

/** 4 — Mid 2000s: a man's hand with rings on a flip phone. */
export const FLIP_ERA: Variant = {
  id: "flip",
  background: "#F6A55E",
  phone: "flip",
  caseColor: "#2B2D33",
  hand: {
    id: "hand-flip",
    skin: "#8A5232",
    skinShadow: "#62361E",
    skinLight: "#A86D47",
    build: 1.1,
    nails: { shape: "short", length: 4, base: "#C3917A" },
    rings: [
      { finger: 0, metal: "silver", stack: true },
      { finger: 2, metal: "gold", stone: "#1B1B22" },
      { finger: "thumb", metal: "silver" },
    ],
    sleeve: "#3C5A8C",
  },
  sparkle: "#FFF4D6",
};

/** 5 — Now: statement neon nails with gems and gold rings on an Android phone. */
export const ANDROID_ERA: Variant = {
  id: "android",
  background: "#D8EE6A",
  phone: "android",
  caseColor: "#1E2028",
  hand: {
    id: "hand-android",
    skin: "#7A4529",
    skinShadow: "#552C17",
    skinLight: "#9B6142",
    nails: {
      shape: "square",
      length: 70,
      base: "#1A1A1F",
      chrome: ["#3BFFB0", "#2A8CFF"],
      glitter: ["#FFFFFF", "#C6FF4D"],
      gems: "#FFFFFF",
    },
    rings: [
      { finger: 0, metal: "gold", stone: "#22C55E" },
      { finger: 1, metal: "gold", stack: true },
      { finger: 3, metal: "gold" },
    ],
    bracelet: "gold",
  },
  sparkle: "#FFFFFF",
};
