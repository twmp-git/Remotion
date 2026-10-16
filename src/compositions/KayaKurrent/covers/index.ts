import type { CoverEntry } from "../Cover";

/**
 * Cover slides (photo + headline) that go before a News story. Use the news story's slug so
 * `npm run kk -- <slug>` renders the cover together with the story.
 * Add new items at the top.
 */
export const COVERS: CoverEntry[] = [
  // 16 October 2026 — Pexels photos (pexels.com/photo/<id>).
  {
    // Pexels 3886248
    slug: "scorchers-zimbabwe",
    headline: "Scorchers Thrash Zimbabwe 7-0,\nSet Up Kenya Clash",
    storyHeadline: "Scorchers Thrash\nZimbabwe 7-0,\nSet Up Kenya Clash",
    photo: "kaya-kurrent/photos/scorchers-cover.jpg",
    photoPosition: "50% 50%",
  },
  {
    // Pexels 32101415
    slug: "bullets-top",
    headline: "Bullets Back on Top\nas Title Race Tightens",
    storyHeadline: "Bullets Back on Top\nas Title Race\nTightens",
    photo: "kaya-kurrent/photos/bullets-cover.jpg",
    photoPosition: "50% 50%",
  },
  {
    // Pexels 5412763
    slug: "beach-sharks-seychelles",
    headline: "Beach Sharks Defend\n6-2 Lead in Salima",
    storyHeadline: "Beach Sharks\nDefend 6-2 Lead\nin Salima",
    photo: "kaya-kurrent/photos/beach-sharks-cover.jpg",
    photoPosition: "50% 40%",
  },
  {
    // Pexels 14094442
    slug: "pope-leo-surgery",
    headline: "Pope Leo Recovering Well\nAfter Lung Cancer Surgery",
    storyHeadline: "Pope Leo Recovering\nWell After\nLung Cancer Surgery",
    storyPhotoPosition: "71% 50%",
    photo: "kaya-kurrent/photos/vatican-cover.jpg",
    photoPosition: "50% 50%",
  },
  {
    // Pexels 11937708
    slug: "ethiopia-mekelle-flights",
    headline: "Ethiopia: Flights Return to\nMekelle as Fighting Eases",
    storyHeadline: "Ethiopia: Flights\nReturn to Mekelle\nas Fighting Eases",
    storyPhotoPosition: "66% 50%",
    photo: "kaya-kurrent/photos/ethiopian-787-cover.jpg",
    photoPosition: "50% 50%",
  },
  {
    // Pexels 4468974
    slug: "un-budget-2027",
    headline: "UN Chief Proposes\nSmaller Budget for 2027",
    storyHeadline: "UN Chief Proposes\nSmaller Budget\nfor 2027",
    photo: "kaya-kurrent/photos/un-flags-cover.jpg",
    photoPosition: "50% 50%",
  },
  {
    // Pexels 34605560
    slug: "mchs-applications-close",
    headline: "Malawi College of Health Sciences\nApplications Close Today",
    storyHeadline:
      "Malawi College of\nHealth Sciences\nApplications\nClose Today",
    photo: "kaya-kurrent/photos/nurses-cover.jpg",
    photoPosition: "50% 30%",
  },
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
