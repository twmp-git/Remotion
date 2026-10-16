import type { OpportunityEntry } from "../Opportunities";

/**
 * Opportunities Desk items. Each gets KK-<slug>-Post (1500×1500) and KK-<slug>-Story (1125×2000).
 * Text comes from the Opportunities Desk crawl report; caption + link go in the post caption.
 * Add new items at the top.
 */
export const OPPORTUNITIES: OpportunityEntry[] = [
  // Crawl report #46. Photo: Pexels 8853505 (solar technician).
  {
    slug: "opp-ban-ki-moon-green-jobs",
    title: "Ban Ki-moon Foundation Green Jobs Mentorship 2026",
    rows: [
      "**Who it's for:**  Young people worldwide interested in green careers",
      "**What you get:**  **Structured mentorship** toward a career in green jobs.",
      "**Deadline:**  Closes 25 October 2026.",
    ],
    photo: "kaya-kurrent/photos/solar-technician.jpg",
    photoPosition: "50% 35%",
  },
  // Crawl report #47. Photo: Pexels 20853361 (village gathering).
  {
    slug: "opp-commonwealth-foundation-grant",
    title: "Commonwealth Foundation Grant 2026-2027",
    rows: [
      "**Who it's for:**  Civil society organisations across the Commonwealth, Malawi included",
      "**What you get:**  **Up to GBP 15,000** for civil society work.",
      "**Deadline:**  Closes 26 October 2026.",
    ],
    photo: "kaya-kurrent/photos/village-meeting.jpg",
    photoPosition: "50% 60%",
  },
  // Crawl report #59. Photo: Pexels 8851548 (scientist at a microscope).
  {
    slug: "opp-dorothy-hodgkin-fellowship",
    title: "Royal Society Dorothy Hodgkin Fellowship 2027",
    rows: [
      "**Who it's for:**  Early-career researchers wanting to lead their own research",
      "**What you get:**  A **funded fellowship** to run your own research programme.",
      "**Deadline:**  Closes 29 October 2026.",
    ],
    photo: "kaya-kurrent/photos/microscope-scientist.jpg",
    photoPosition: "40% 40%",
  },
  // Crawl report #60. Photo: Pexels 5029929 (tree planting).
  {
    slug: "opp-tyler-prize-ambassador",
    title: "Tyler Prize Student Ambassador 2027",
    rows: [
      "**Who it's for:**  Students worldwide",
      "**What you get:**  An **ambassador role** with a leading environmental prize.",
      "**Deadline:**  Closes 30 October 2026.",
    ],
    photo: "kaya-kurrent/photos/tree-planting.jpg",
    photoPosition: "50% 55%",
  },
  // Crawl report #101. Photo: Pexels 6077123 (Lady Justice and gavel).
  {
    slug: "opp-un-international-law-africa",
    title: "UN Regional Course in International Law for Africa 2027",
    rows: [
      "**Who it's for:**  African lawyers and government officials",
      "**What you get:**  A **place on the UN regional international law course**, with funding available.",
      "**Deadline:**  Closes 30 October 2026.",
    ],
    photo: "kaya-kurrent/photos/lady-justice.jpg",
    photoPosition: "50% 60%",
  },
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
