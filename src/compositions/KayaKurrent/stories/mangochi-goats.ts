import type { KKStoryEntry } from "../schema";

// Source: Kaya Kurrent Notices and Stories 2026-10-16, item 4 (story). Published as written.
// Headline shortened to 8 words (was "Mangochi Plans to Buy 166 Goats for Families in Lulanga"). Source line dropped (no links on stories).
// Source: Mangochi District Council notice ref MHDC/GOATS/MBSPIII, https://ppda.mw/storage/documents/opentenders/RFQ GOATS ICELAND MH.pdf
// Non-breaking spaces (\u00a0) keep phrases together when the headline wraps.
export const mangochiGoats: KKStoryEntry = {
  slug: "mangochi-goats",
  headline: "Mangochi Plans to Buy 166\u00a0Goats for\u00a0Lulanga",
  byline: "By Staff Reporter",
  lede: "Mangochi District Council plans to buy 166 goats for families under Traditional Authority Lulanga.",
  body: [
    "A notice dated 14 October asks suppliers to quote for 160 female goats and 6 Boer bucks. Boer goats are a breed raised for meat, and the bucks will be used for breeding.",
    "The council has set rules for the goats. Each female must be at least nine months old, come from a family that has had twins, have a good record of feeding its young, and be healthy. Each buck must be at least one year old, with strong legs and good muscle.",
    "All the goats must come from the same area of Mangochi, so they are used to local conditions.",
    "The notice's reference number includes 'MBSPIII'. Copies of quotes must be emailed to the council, with a copy to an Icelandic government email address.",
    "Suppliers must deliver the goats to the council within 45 days of an order. Quotes close at 2pm on 19 October. Sealed quotes go to the Chairperson of the council's Internal Procurement and Disposal Committee, Private Bag 138, Mangochi.",
    "The notice does not say how many families will receive goats or how they were chosen.",
  ],
};
