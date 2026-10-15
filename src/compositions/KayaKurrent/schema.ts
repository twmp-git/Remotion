import { z } from "zod";

/**
 * One news story. Wrap words in **double asterisks** to make them bold
 * (house style: names of people and organisations on first mention).
 */
export const kkStorySchema = z.object({
  headline: z.string(),
  byline: z.string(),
  /** Opening paragraph, set in bold under the byline. */
  lede: z.string(),
  /** Remaining paragraphs, in order. */
  body: z.array(z.string()),
  /** Optional photo in public/ (e.g. "kaya-kurrent/photos/milk.jpg"), shown faded behind the square post. */
  photo: z.string().optional(),
});

export type KKStory = z.infer<typeof kkStorySchema>;

export type KKStoryEntry = KKStory & {
  /** Used in composition ids and file names: lowercase letters, digits and dashes. */
  slug: string;
};
