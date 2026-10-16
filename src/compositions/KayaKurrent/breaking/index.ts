import type { BreakingEntry } from "../BreakingNews";

/**
 * Breaking News items. Each gets KK-<slug>-Post (2000×2000) and KK-<slug>-Story (1125×2000).
 * Photos go in public/kaya-kurrent/photos/. Add new items at the top.
 */
export const BREAKING: BreakingEntry[] = [
  // Reference: the user's own template, rebuilt (photo cropped from it).
  {
    slug: "breaking-speaker-reference",
    headline:
      "Speaker is well within his rights to engage civil societies on matters pertaining Abuse of Office",
    subline: "Something will be done but perhaps it might be too late.",
    photo: "kaya-kurrent/photos/speaker-post.jpg",
    storyPhoto: "kaya-kurrent/photos/speaker-story.jpg",
  },
];
