import type { KKStoryEntry } from "../schema";

// Source: Kaya Kurrent Notices and Stories 2026-10-16, item 1 (story). Published as written.
// Headline shortened to 8 words (was "Mzuzu Central Hospital Plans to Buy Anaesthesia Machines, Ultrasound and Theatre Lights").
// Cut: the "Other items include a defibrillator…" paragraph, and the source line (no links on stories).
// Source: Mzuzu Central Hospital tender ref 031/MZCH/2026-27/070, https://ppda.mw/storage/documents/opentenders/RFQ- MEDICAL EQUIPMENT.pdf
// Non-breaking spaces (\u00a0) keep phrases together when the headline wraps.
export const mzuzuHospitalEquipment: KKStoryEntry = {
  slug: "mzuzu-hospital-equipment",
  headline: "Mzuzu Central Hospital Plans to\u00a0Buy Medical Equipment",
  byline: "By Staff Reporter",
  lede: "Mzuzu Central Hospital plans to buy new equipment for its operating theatres, wards and maternity unit.",
  body: [
    "A tender notice dated 8 October asks suppliers to quote for seven lots. The biggest items are two anaesthesia machines, one ultrasound machine and four LED theatre lights.",
    "The anaesthesia machines keep patients asleep and breathing safely during surgery. The theatre lights let surgeons see clearly while they operate.",
    "The list also includes 10 infusion pumps, which control drips, and 8 diathermy machines, which surgeons use to cut tissue and stop bleeding. There are 6 vein finders, which help nurses find a vein for a drip or an injection.",
    "For mothers, the hospital wants a CTG machine. It tracks an unborn baby's heartbeat during labour.",
    "Mzuzu Central Hospital is the main referral hospital for the Northern Region. Patients from Karonga, Chitipa, Rumphi, Nkhata Bay, Likoma and Mzimba are sent there for care their district hospitals cannot give.",
    "Suppliers must hand in sealed quotes by 10am on Tuesday, 27 October. Quotes go in the tender box in the hospital library, in the Administration Block. They must be valid for 30 days, and the goods must arrive within 30 days of an order.",
    "The notice does not say how the equipment will be paid for, or what it will replace.",
  ],
};
