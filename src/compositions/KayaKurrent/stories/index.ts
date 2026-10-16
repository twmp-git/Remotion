import type { KKStoryEntry } from "../schema";
import { balakaRareEarthMine } from "./balaka-rare-earth-mine";
import { mangochiGoats } from "./mangochi-goats";
import { mustToiletPaperLine } from "./must-toilet-paper-line";
import { mzuzuHospitalEquipment } from "./mzuzu-hospital-equipment";
import { beachSharksSeychelles } from "./beach-sharks-seychelles";
import { bulletsTop } from "./bullets-top";
import { ethiopiaMekelleFlights } from "./ethiopia-mekelle-flights";
import { mchsApplicationsClose } from "./mchs-applications-close";
import { popeLeoSurgery } from "./pope-leo-surgery";
import { scorchersZimbabwe } from "./scorchers-zimbabwe";
import { unBudget2027 } from "./un-budget-2027";
import { childMarriageLaws } from "./child-marriage-laws";
import { deafCommunicationBarriers } from "./deaf-communication-barriers";
import { imfEcfDeal } from "./imf-ecf-deal";
import { milkPriceRelief } from "./milk-price-relief";
import { photographyYouthIncome } from "./photography-youth-income";

/**
 * Every story gets two stills in Studio's "KayaKurrent" folder:
 *   KK-<slug>-Post  (square, 1500×1500)   KK-<slug>-Story  (vertical, 1080×1920)
 * Add new stories at the top.
 */
export const STORIES: KKStoryEntry[] = [
  // Notices and Stories sweep, 16 October 2026
  mzuzuHospitalEquipment,
  mustToiletPaperLine,
  mangochiGoats,
  balakaRareEarthMine,
  // 16 October 2026
  scorchersZimbabwe,
  bulletsTop,
  beachSharksSeychelles,
  popeLeoSurgery,
  ethiopiaMekelleFlights,
  unBudget2027,
  mchsApplicationsClose,
  // 15 October 2026
  milkPriceRelief,
  photographyYouthIncome,
  deafCommunicationBarriers,
  childMarriageLaws,
  imfEcfDeal,
];
