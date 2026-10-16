import type { OpportunityEntry } from "../Opportunities";

/**
 * Opportunities Desk items. Each gets KK-<slug>-Post (1500×1500) and KK-<slug>-Story (1125×2000).
 * Text comes from the Opportunities Desk crawl report; caption + link go in the post caption.
 * Add new items at the top.
 */
export const OPPORTUNITIES: OpportunityEntry[] = [
  // Crawl report 16-22 October 2026, #4. The report's source link is a Google search, not the official page.
  {
    slug: "opp-royal-entomological-photo",
    title: "Royal Entomological Society Photography Competition",
    rows: [
      "**Who it's for:**  Photographers worldwide",
      "**What you get:**  **Cash prizes** plus publication across the Society's platforms.",
      "**Deadline:**  Closes 31 October 2026.",
    ],
    photo: "kaya-kurrent/photos/insect-macro.jpg",
    photoPosition: "50% 62%",
  },
  // Crawl report #3.
  {
    slug: "opp-first-flights-film-fund",
    title: "First Flights Short Film Fund",
    rows: [
      "**Who it's for:**  Emerging filmmakers worldwide",
      "**What you get:**  **Up to US$10,000** to bring an original short film to life.",
      "**Deadline:**  Closes 31 October 2026.",
    ],
    photo: "kaya-kurrent/photos/film-set.jpg",
    photoPosition: "50% 30%",
  },
  // Crawl report #5.
  {
    slug: "opp-evaristo-poetry-prize",
    title: "Evaristo Prize for African Poetry",
    rows: [
      "**Who it's for:**  Emerging African poets who have not yet published a full-length collection",
      "**What you get:**  **US$1,500** plus publication and recognition.",
      "**Deadline:**  Closes 1 November 2026.",
    ],
    photo: "kaya-kurrent/photos/poetry-books.jpg",
    photoPosition: "50% 45%",
  },
  // Crawl report #1 — also the user's own template, rebuilt (band photo cropped from it, already blurred).
  {
    slug: "opp-au-logo-competition",
    title: "AU Theme of the Year 2027 Logo Competition",
    rows: [
      "**Who it's for:**  Designers across Africa, including Malawians",
      "**What you get:**  **US$5,000** and your logo used by the African Union for a whole year.",
      "**Deadline:**  Closes 23 October 2026.",
    ],
    photo: "kaya-kurrent/photos/opportunities-reference-band.jpg",
    // Strip above the card only (the full band has the old card baked in).
    storyPhoto: "kaya-kurrent/photos/opportunities-reference-strip.jpg",
    photoBlur: 0,
  },
];
