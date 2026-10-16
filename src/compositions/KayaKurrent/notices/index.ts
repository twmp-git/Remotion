import type { NoticeEntry } from "../PublicNotice";

/**
 * Public Notice items. Each gets KK-<slug>-Post (2000×2000) and KK-<slug>-Story (1125×2000).
 * Add new items at the top.
 */
export const NOTICES: NoticeEntry[] = [
  // Reference: the user's own template, rebuilt.
  {
    slug: "notice-mera-fuel-reference",
    title: "MERA Adjusts Fuel Pump Prices",
    items: [
      "**Petrol:** MK 2,530.00 per litre",
      "**Diesel:** MK 2,610.00 per litre",
      "**Paraffin:** MK 1,895.00 per litre",
    ],
    source: "Source: MERA public notice, 3 October 2026",
  },
];
