import type { Env } from "@mom/config";
import type { Business } from "@mom/db";
import type { Suggestion } from "../marketing/suggestion.types";

/**
 * The Vertical seam — "build vertically, architect horizontally."
 *
 * A Vertical is the single place ALL niche-specific logic lives: the AI persona
 * and guardrails, the onboarding questions, the north-star metric, and (as we
 * build them) proactive signals, compliance rules, and lead magnets. The
 * generic spine (Business, Content, Post, the AI/storage providers) stays
 * vertical-agnostic and calls into the resolved Vertical.
 *
 * Rule we follow: a capability only graduates from a Vertical into the shared
 * core once a SECOND vertical needs it. Until then, niche depth lives here — not
 * smeared across generic services.
 */

export interface OnboardingQuestion {
  /** Stored key, e.g. "whatWeDo", "nmlsId". */
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type: "text" | "textarea" | "choice";
  choices?: { value: string; label: string }[];
  /** Optional helper text shown under the field. */
  hint?: string;
}

export interface Vertical {
  /** Stable identifier persisted on Business.verticalKey. */
  key: string;
  /** Human label, e.g. "Mortgage Advisor". */
  label: string;
  /** The north-star this vertical's AI optimizes for, shown in the UI. */
  primaryGoalLabel: string;

  /** Persona injected into content prompts (who the AI is writing as). */
  contentPersona: string;
  /** Extra guardrails/guidance appended to the content system prompt. */
  contentGuidance: string;

  /** Vertical-specific onboarding questions. */
  onboardingQuestions: OnboardingQuestion[];

  /**
   * Optional: proactive, niche suggestions (e.g. rate-drop → refi post). The
   * marketing engine merges these with its generic, signal-based suggestions.
   * Left unimplemented until the underlying data (rates, market) exists.
   */
  contributeSuggestions?(input: {
    env: Env;
    business: Business;
  }): Promise<Suggestion[]>;
}
