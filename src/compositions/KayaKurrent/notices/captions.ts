/**
 * Caption + link for each Public Notice post (not drawn on the image). The link goes only where links are clickable
 * (Facebook, Threads), as "Full notice: <link>". Captions for the first four come from the user's "Notices and
 * Stories" sweep (16 October 2026); the four single-tender captions were written by Claude in the same style,
 * because the sweep listed those tenders together on one card.
 */
export const NOTICE_CAPTIONS: Record<string, { caption: string; link: string }> = {
  "notice-mzuzu-hospital-equipment": {
    caption:
      "Mzuzu Central Hospital invites quotes for medical equipment in seven lots, including two anaesthesia machines, an ultrasound machine and four theatre lights. Sealed quotes go in the tender box in the hospital library, Administration Block, by 10:00am on 27 October. Ref: 031/MZCH/2026-27/070.",
    link: "https://ppda.mw/tenders",
  },
  "notice-blantyre-air-travel": {
    caption:
      "Blantyre City Council invites medium-sized firms to quote for air travel to Antalya, Turkey. Collect documents at the Civic Centre, 8:00am to 4:30pm, until 19 October. Quotes close at 10:00am that day. Ref: BCC/SERVICE/02/10/13.",
    link: "https://ppda.mw/tenders",
  },
  "notice-must-toilet-paper-line": {
    caption:
      "The Malawi University of Science and Technology invites bids to supply, install and start an automated toilet paper production line. Bid documents cost MK 30,000. Bids close and open at 10:00am on 2 November at Ndata. Ref: ICB-MUST-G-2025/26-230.",
    link: "https://ppda.mw/tenders",
  },
  "notice-mangochi-goats": {
    caption:
      "Mangochi District Council invites quotes for 166 goats for T/A Lulanga: 160 nannies and 6 Boer bucks, all from the same area of Mangochi. Sealed quotes close at 2:00pm on 19 October. Ref: MHDC/GOATS/MBSPIII.",
    link: "https://ppda.mw/tenders",
  },
  "notice-parliament-ushers-uniforms": {
    caption: "Parliament invites quotes for ushers' uniforms. Quotes close on 21 October.",
    link: "https://ppda.mw/tenders",
  },
  "notice-unima-blood-count-machine": {
    caption: "The University of Malawi (UNIMA) invites quotes for a blood count machine. Quotes close on 19 October.",
    link: "https://ppda.mw/tenders",
  },
  "notice-mining-lab-equipment": {
    caption: "The Ministry of Mining invites quotes for laboratory equipment. Quotes close on 28 October.",
    link: "https://ppda.mw/tenders",
  },
  "notice-salima-roads-bridges": {
    caption: "Salima District Council invites bids for roads and bridges works. Bids close on 29 October.",
    link: "https://ppda.mw/tenders",
  },
};
