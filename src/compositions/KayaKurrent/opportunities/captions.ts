/**
 * Caption + link for each Opportunities post (the "caption file"; not drawn on the image). `caption` is the crawl
 * report's SHORT CAPTION as written; scripts/kk-plan.mjs adds the link on Facebook and Threads, where links are
 * clickable. `hold` keeps an item out of posting plans, with the reason.
 *
 * Source: Opportunities Desk crawl report, 16–22 October 2026 (104 items, verified 16 October). `crawl` is the
 * item number in that report. The report's links that were a Google search or a general listing page were replaced
 * with the official page (found 16 October).
 */
export const OPPORTUNITY_CAPTIONS: Record<string, { crawl: string; caption: string; link: string; hold?: string }> = {
  "opp-au-logo-competition": {
    crawl: "16-22 Oct #1",
    caption:
      "OPPORTUNITY OF THE DAY\nAU Theme of the Year 2027 Logo Competition - US$5,000 prize.\nFor: Designers across Africa, including Malawians.\nDeadline: 23 October 2026. Full details and link on our page.\n#OpportunitiesDesk",
    link: "https://opportunitydesk.org/2026/10/08/au-theme-of-the-year-2027-logo-competition/",
  },
  "opp-first-flights-film-fund": {
    crawl: "16-22 Oct #3",
    caption:
      "OPPORTUNITY OF THE DAY\nFirst Flights Short Film Fund - Up to US$10,000.\nFor: Emerging filmmakers worldwide.\nDeadline: 31 October 2026. Full details and link on our page.\n#OpportunitiesDesk",
    link: "https://www.interartsfunding.com/opencalls",
    hold: "the report's link is a listing page, and searches show the 2026 round closed on 30 April 2026 — confirm a new round first",
  },
  "opp-royal-entomological-photo": {
    crawl: "16-22 Oct #4",
    // The official terms limit entry to amateurs (free to enter); the report said "Photographers worldwide".
    caption:
      "OPPORTUNITY OF THE DAY\nRoyal Entomological Society Photography Competition - Cash prizes.\nFor: Amateur photographers worldwide.\nDeadline: 31 October 2026. Full details and link on our page.\n#OpportunitiesDesk",
    link: "https://www.insectweek.org/art-and-photography/",
  },
  "opp-evaristo-poetry-prize": {
    crawl: "16-22 Oct #5",
    caption:
      "OPPORTUNITY OF THE DAY\nEvaristo Prize for African Poetry - US$1,500.\nFor: Emerging African poets who have not yet published a full-length collection.\nDeadline: 1 November 2026. Full details and link on our page.\n#OpportunitiesDesk",
    link: "https://africanpoetrybf.brown.edu/contest-prizes/evaristo-prize-for-african-poetry/",
  },
  "opp-ban-ki-moon-green-jobs": {
    crawl: "#46",
    caption:
      "OPPORTUNITY OF THE DAY\nBan Ki-moon Foundation - Your Future in Green Jobs Mentorship 2026 - Mentorship programme.\nFor: Young people worldwide interested in green careers.\nDeadline: 25 October 2026. Full details and link on our page.\n#OpportunitiesDesk",
    link: "https://opportunitydesk.org/2026/10/13/bkmf-your-future-in-green-jobs-mentorship-program-2026/",
  },
  "opp-commonwealth-foundation-grant": {
    crawl: "#47",
    caption:
      "OPPORTUNITY OF THE DAY\nCommonwealth Foundation Grant 2026-2027 - Up to GBP 15,000.\nFor: Civil society organisations across the Commonwealth, Malawi included.\nDeadline: 26 October 2026. Full details and link on our page.\n#OpportunitiesDesk",
    link: "https://opportunitydesk.org/2026/09/26/commonwealth-foundation-grant-2026-2027/",
  },
  "opp-dorothy-hodgkin-fellowship": {
    crawl: "#59",
    caption:
      "OPPORTUNITY OF THE DAY\nRoyal Society Dorothy Hodgkin Fellowship 2027 - Funded research fellowship.\nFor: Early-career researchers wanting to lead their own research.\nDeadline: 29 October 2026. Full details and link on our page.\n#OpportunitiesDesk",
    link: "https://opportunitydesk.org/2026/10/14/dorothy-hodgkin-fellowship-2027/",
  },
  "opp-tyler-prize-ambassador": {
    crawl: "#60",
    caption:
      "OPPORTUNITY OF THE DAY\nTyler Prize Student Ambassador 2027 - Ambassador role and platform.\nFor: Students worldwide.\nDeadline: 30 October 2026. Full details and link on our page.\n#OpportunitiesDesk",
    link: "https://opportunitydesk.org/2026/10/14/tyler-prize-student-ambassador-2027/",
  },
  "opp-un-international-law-africa": {
    crawl: "#101",
    caption:
      "OPPORTUNITY OF THE DAY\nUnited Nations Regional Course in International Law for Africa 2027 - Funding available.\nFor: African lawyers and government officials.\nDeadline: 30 October 2026. Full details and link on our page.\n#OpportunitiesDesk",
    link: "https://opportunitydesk.org/2026/10/13/united-nations-regional-course-in-international-law-for-africa-2027/",
  },
};
