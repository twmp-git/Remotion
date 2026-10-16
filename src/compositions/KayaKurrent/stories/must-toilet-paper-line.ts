import type { KKStoryEntry } from "../schema";

// Source: Kaya Kurrent Notices and Stories 2026-10-16, item 3 (story). Published as written.
// Headline shortened to 8 words (was "MUST Plans to Buy a Toilet Paper Production Line"). Source line dropped (no links on stories).
// Doubtful, flagged to the user: "MUST is a public university at Bvumbwe" — its campus is usually described as Ndata, Thyolo.
// Source: MUST tender ref ICB-MUST-G-2025/26-230, https://ppda.mw/storage/documents/opentenders/IFB Advert- Toilet paper manufacturing.pdf
// Non-breaking spaces (\u00a0) keep phrases together when the headline wraps.
export const mustToiletPaperLine: KKStoryEntry = {
  slug: "must-toilet-paper-line",
  headline: "MUST Plans to Buy Toilet\u00a0Paper Production\u00a0Line",
  byline: "By Staff Reporter",
  lede: "The Malawi University of Science and Technology (MUST) wants to buy a machine that makes toilet paper.",
  body: [
    "In a notice on the **PPDA** website, the university invites bids to supply, deliver, install and start up an automated toilet paper production line. The winning firm must finish the job within 8 to 10 weeks.",
    "MUST is a public university at Bvumbwe, in Thyolo District. It teaches engineering, science and technology.",
    "The notice says MUST 'has budgeted resources' for the project. It does not say how much toilet paper the machine will make, or whether the university will sell it.",
    "Firms that want to bid must buy the bidding document for K30,000 in cash. The fee cannot be refunded.",
    "Bids close at 10am on Monday, 2 November. They will be opened in public the same morning in the Mini Conference Room on the ground floor at Ndata. Electronic bids will not be accepted, and late bids will be returned unopened.",
    "The tender is open to all eligible and qualified bidders, including firms from outside Malawi.",
  ],
};
