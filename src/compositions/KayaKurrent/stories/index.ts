import type { KKStoryEntry } from "../schema";
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
  milkPriceRelief,
  photographyYouthIncome,
  deafCommunicationBarriers,
  childMarriageLaws,
  imfEcfDeal,
];
