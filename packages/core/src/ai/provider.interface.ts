import type { ContentPlan } from "./schemas/content-plan";
import type { BusinessKnowledge } from "./schemas/knowledge";
import type { ContentIdea } from "./schemas/ideas";

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
  /** Condensed Business Knowledge Profile, when available. */
  knowledgeSummary?: string | null;
  /** Recurring topics the AI has learned for this business. */
  topics?: string[] | null;
}

/** What we know about the uploaded asset before generation. */
export interface AssetContext {
  type: "VIDEO" | "IMAGE" | "IDEA";
  originalName?: string | null;
  /** Optional free-text context the user added, or the idea itself. */
  contextNote?: string | null;
}

export interface GenerateContentPlanInput {
  business: BusinessContext;
  asset: AssetContext;
  /** How many alternative variations to produce (in addition to primary). */
  variationCount?: number;
}

/** Inputs for building the Business Knowledge Profile during onboarding. */
export interface BuildKnowledgeInput {
  name: string;
  /** "What does your business do?" */
  whatWeDo: string;
  /** "Who is your ideal customer?" */
  idealCustomer?: string | null;
  /** "What's your main goal?" e.g. leads/sales/awareness. */
  goal?: string | null;
  /** Optional profile links the AI can learn from. */
  links?: {
    website?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    linkedin?: string | null;
  };
}

export interface ContentIdeasInput {
  business: BusinessContext;
  knowledge?: BusinessKnowledge | null;
  count?: number;
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

  /**
   * Build the Business Knowledge Profile from onboarding answers (+ links).
   * The "tell me a little, I'll learn the rest" step.
   */
  generateBusinessKnowledge(
    input: BuildKnowledgeInput,
  ): Promise<BusinessKnowledge>;

  /**
   * Proactively propose fresh content ideas — the AI acting as a marketing
   * manager rather than a passive generator.
   */
  generateContentIdeas(input: ContentIdeasInput): Promise<ContentIdea[]>;
}
