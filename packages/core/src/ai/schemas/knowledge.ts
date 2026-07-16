import { z } from "zod";

/**
 * The Business Knowledge Profile — the AI's derived understanding of the
 * business. Seeded from a few onboarding answers (+ optional links) and
 * intended to keep improving from content, edits, and performance. Everything
 * the engine writes is grounded in this profile so output feels on-brand.
 */
export const businessKnowledgeSchema = z.object({
  /** One-paragraph summary of the business in its own voice. */
  summary: z.string().min(1),
  /** Concrete services/offerings. */
  services: z.array(z.string().min(1)),
  /** Who the ideal customer is. */
  audience: z.string().min(1),
  /** Tone of voice, e.g. "warm, credible, plain-spoken". */
  tone: z.string().min(1),
  /** Common customer pain points the content should speak to. */
  painPoints: z.array(z.string().min(1)),
  /** Recurring topics/themes to post about. */
  topics: z.array(z.string().min(1)),
  /** How this business tends to write (sentence length, formality, emoji…). */
  writingStyle: z.string().min(1),
  /** How it tends to ask for the next step (its CTA style). */
  ctaStyle: z.string().min(1),
});
export type BusinessKnowledge = z.infer<typeof businessKnowledgeSchema>;
