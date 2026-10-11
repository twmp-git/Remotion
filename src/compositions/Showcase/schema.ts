import { z } from "zod";

/** Props editable in the Remotion Studio sidebar and via `--props` on render. */
export const showcaseSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  cta: z.string(),
  withAudio: z.boolean(),
});

export type ShowcaseProps = z.infer<typeof showcaseSchema>;

