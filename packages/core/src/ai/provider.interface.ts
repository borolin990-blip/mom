import type { ContentPlan } from "./schemas/content-plan";

/**
 * The AI provider abstraction.
 *
 * This is the single seam between the product and whatever model/vendor
 * generates content. Application code depends ONLY on this interface, so we can
 * swap OpenAI for another provider (or a fine-tuned model) without touching the
 * services or UI. The `mock` provider implements the same contract so the whole
 * product runs end-to-end with no API key.
 */

/** Business identity — injected into every prompt so output is niche-specific. */
export interface BusinessContext {
  name: string;
  industry: string;
  targetAudience?: string | null;
  brandTone?: string | null;
  goals: string[];
  description?: string | null;
}

/** What we know about the uploaded asset before generation. */
export interface AssetContext {
  type: "VIDEO" | "IMAGE";
  originalName?: string | null;
  /** Optional free-text context the user added about the content. */
  contextNote?: string | null;
}

export interface GenerateContentPlanInput {
  business: BusinessContext;
  asset: AssetContext;
  /** How many alternative variations to produce (in addition to primary). */
  variationCount?: number;
}

export interface AIProvider {
  /** Stable identifier, e.g. "mock" or "openai". */
  readonly name: string;
  /** Concrete model used (for auditability/persistence). */
  readonly model: string;
  /**
   * Analyze the content in context of the business and produce a full,
   * validated content plan. Implementations must return schema-valid data.
   */
  generateContentPlan(input: GenerateContentPlanInput): Promise<ContentPlan>;
}
