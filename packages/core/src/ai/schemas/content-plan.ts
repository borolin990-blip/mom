import { z } from "zod";

/**
 * Typed, validated shape of everything the AI engine produces for one piece of
 * uploaded content. Every AIProvider (mock, openai, future models) MUST return
 * data matching this schema, so the rest of the app never deals with raw model
 * output — only trusted, structured values.
 */

export const PLATFORMS = [
  "FACEBOOK",
  "INSTAGRAM",
  "TIKTOK",
  "LINKEDIN",
  "YOUTUBE",
] as const;
export type PlatformHint = (typeof PLATFORMS)[number];

/** One complete, ready-to-post variation of the content. */
export const contentVariationSchema = z.object({
  /** Scroll-stopping first line. */
  hook: z.string().min(1),
  /** Full post caption/body. */
  caption: z.string().min(1),
  /** Longer description (for YouTube/LinkedIn style platforms). */
  description: z.string().min(1),
  /** Explicit call to action aimed at generating a lead. */
  cta: z.string().min(1),
  /** Hashtags WITHOUT the leading '#'. */
  hashtags: z.array(z.string().min(1)).min(1),
});
export type ContentVariation = z.infer<typeof contentVariationSchema>;

/** The engine's understanding of the uploaded content. */
export const contentAnalysisSchema = z.object({
  summary: z.string().min(1),
  topics: z.array(z.string().min(1)),
  detectedTone: z.string().min(1),
  suggestedContentType: z.string().min(1),
});
export type ContentAnalysis = z.infer<typeof contentAnalysisSchema>;

/** The full content plan: analysis + a primary post + alternative variations. */
export const contentPlanSchema = z.object({
  analysis: contentAnalysisSchema,
  /** Business-facing content category, e.g. "Educational", "Testimonial". */
  category: z.string().min(1),
  /** Which platform this content is best suited for. */
  platformHint: z.enum(PLATFORMS),
  /** The recommended primary variation. */
  primary: contentVariationSchema,
  /** Alternative angles the user can pick from. */
  variations: z.array(contentVariationSchema),
});
export type ContentPlan = z.infer<typeof contentPlanSchema>;
