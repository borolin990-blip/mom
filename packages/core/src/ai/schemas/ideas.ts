import { z } from "zod";

/**
 * A proactive content idea the AI proposes — the raw material behind the
 * "Here are ideas based on your business" experience.
 */
export const contentIdeaSchema = z.object({
  /** Short, punchy idea title. */
  title: z.string().min(1),
  /** The angle/approach in one sentence. */
  angle: z.string().min(1),
  /** Suggested format, e.g. "Short video", "Carousel", "Personal story". */
  format: z.string().min(1),
  /** Why this idea is worth posting now (the manager's reasoning). */
  why: z.string().min(1),
});
export type ContentIdea = z.infer<typeof contentIdeaSchema>;

export const contentIdeasSchema = z.array(contentIdeaSchema);
