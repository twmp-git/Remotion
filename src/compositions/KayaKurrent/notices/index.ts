import type { NoticeEntry } from "../PublicNotice";

/**
 * Public Notice items. Each gets KK-<slug>-Post (2000×2000) and KK-<slug>-Story (1125×2000).
 * Add new items at the top.
 */
export const NOTICES: NoticeEntry[] = [
  // Notices and Stories sweep, 16 October 2026. Captions + links: notices/captions.ts.
  {
    slug: "notice-mzuzu-hospital-equipment",
    title: "Mzuzu Central Hospital\nSeeks Equipment Suppliers",
    storyTitle: "Mzuzu Central\nHospital Seeks\nEquipment\nSuppliers",
    items: [
      "**Items:** Anaesthesia, ultrasound, theatre lights",
      "**Closes:** 27 October 2026, 10:00am",
      "**Submit:** Tender box, hospital library",
    ],
    source: "Source: Mzuzu Central Hospital tender notice, 8 October 2026",
  },
  {
    slug: "notice-blantyre-air-travel",
    title: "Blantyre City Council\nSeeks Air Travel Quotes",
    storyTitle: "Blantyre City\nCouncil Seeks\nAir Travel\nQuotes",
    items: [
      "**Route:** Bakili Muluzi Airport to Antalya, Turkey",
      "**Closes:** 19 October 2026, 10:00am",
      "**Collect:** Procurement Unit, Civic Centre",
    ],
    source: "Source: Blantyre City Council notice, 14 October 2026",
  },
  {
    slug: "notice-must-toilet-paper-line",
    title: "MUST Invites Bids\nfor Toilet Paper\nProduction Line",
    items: [
      "**Bid document:** MK 30,000, cash",
      "**Closes:** 2 November 2026, 10:00am",
      "**Venue:** Mini Conference Room, Ndata",
    ],
    source: "Source: MUST tender notice, 6 October 2026",
  },
  {
    slug: "notice-mangochi-goats",
    title: "Mangochi District\nCouncil Seeks\n166 Goats",
    items: [
      "**Order:** 160 nannies, 6 Boer bucks",
      "**Closes:** 19 October 2026, 2:00pm",
      "**Deliver to:** Mangochi District Council",
    ],
    source: "Source: Mangochi District Council notice, 14 October 2026",
  },
  // "Tenders This Week", one card per tender (the user's choice). The sweep only gave the item and closing date;
  // Mzuzu Central Hospital and MUST have their own cards above.
  {
    slug: "notice-parliament-ushers-uniforms",
    title: "Parliament Seeks\nSuppliers for\nUshers' Uniforms",
    items: ["**Item:** Ushers' uniforms", "**Closes:** 21 October 2026", "**Details:** On the PPDA website"],
    source: "Source: PPDA tender notices, 9–14 October 2026",
  },
  {
    slug: "notice-unima-blood-count-machine",
    title: "UNIMA Seeks Suppliers\nfor a Blood Count Machine",
    storyTitle: "UNIMA Seeks\nSuppliers for a\nBlood Count\nMachine",
    items: ["**Item:** Blood count machine", "**Closes:** 19 October 2026", "**Details:** On the PPDA website"],
    source: "Source: PPDA tender notices, 9–14 October 2026",
  },
  {
    slug: "notice-mining-lab-equipment",
    title: "Ministry of Mining\nSeeks Lab Equipment\nSuppliers",
    storyTitle: "Ministry of\nMining Seeks\nLab Equipment\nSuppliers",
    items: ["**Item:** Laboratory equipment", "**Closes:** 28 October 2026", "**Details:** On the PPDA website"],
    source: "Source: PPDA tender notices, 9–14 October 2026",
  },
  {
    slug: "notice-salima-roads-bridges",
    title: "Salima District Council\nInvites Bids for\nRoads and Bridges",
    storyTitle: "Salima District\nCouncil Invites\nBids for Roads\nand Bridges",
    items: ["**Works:** Roads and bridges", "**Closes:** 29 October 2026", "**Details:** On the PPDA website"],
    source: "Source: PPDA tender notices, 9–14 October 2026",
  },
  // Reference: the user's own template, rebuilt.
  {
    slug: "notice-mera-fuel-reference",
    title: "MERA Adjusts\nFuel Pump Prices",
    storyTitle: "MERA Adjusts\nFuel Pump\nPrices",
    items: [
      "**Petrol:** MK 2,530.00 per litre",
      "**Diesel:** MK 2,610.00 per litre",
      "**Paraffin:** MK 1,895.00 per litre",
    ],
    source: "Source: MERA public notice, 3 October 2026",
  },
];
