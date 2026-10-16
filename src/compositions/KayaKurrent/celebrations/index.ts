import type { CelebrationEntry } from "../Celebration";

/**
 * Celebration cards (holidays, anniversaries). Each gets KK-<slug>-Post (1600×2000)
 * and KK-<slug>-Story (1125×2000). Add new items at the top.
 */
export const CELEBRATIONS: CelebrationEntry[] = [
  // Reference: the user's own template, rebuilt (keeps the template's champagne photo).
  {
    slug: "celebration-new-year-reference",
    message: "Happy New Year",
    sticky: "2027",
    date: { day: "28", month: "October" },
    endDate: { day: "01", month: "November" },
  },
];
