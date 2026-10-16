import type { CoverEntry } from "../Cover";

/**
 * Cover slides (photo + headline) that go before a News story. Use the news story's slug so
 * `npm run kk -- <slug>` renders the cover together with the story.
 * Add new items at the top.
 */
export const COVERS: CoverEntry[] = [
  // Cover for the "photography-youth-income" story. The square uses the photo cropped from the
  // user's own cover; the vertical uses only its top (the rest had the old panel baked in).
  {
    slug: "photography-youth-income",
    headline: "Photography Emerging as Source of Income for Youth",
    photo: "kaya-kurrent/photos/cover-reference-photographer.jpg",
    storyPhoto: "kaya-kurrent/photos/photographer-top.jpg",
    storyPhotoPosition: "52% 0%",
  },
  // The user's square reference cover, rebuilt (photo cropped from it) — regression check.
  {
    slug: "cover-reference-photographer",
    headline: "Photography Emerging as Source of Income for Youth",
    photo: "kaya-kurrent/photos/cover-reference-photographer.jpg",
  },
  // The user's vertical reference cover, rebuilt (photo cropped from it) — regression check.
  {
    slug: "cover-reference-united",
    headline: "Same Old United, New Problems",
    photo: "kaya-kurrent/photos/cover-reference-united.jpg",
  },
];
