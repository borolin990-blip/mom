import type { Env } from "@mom/config";
import type { Business } from "@mom/db";
import type { Suggestion } from "../marketing/suggestion.types";

/**
 * The Vertical seam — "build vertically, architect horizontally."
 *
 * A Vertical is the single place ALL niche logic lives: persona + guardrails,
 * onboarding questions, the north-star metric, the selectable growth goals, the
 * content pillars, weekly research substance, and the content seeds the Weekly
 * Cycle engine composes into a plan. The engine and UI are vertical-agnostic and
 * read everything through this contract, so a new vertical (real estate,
 * insurance, legal, accounting…) plugs into the same workflow by adding a module.
 */

export interface OnboardingQuestion {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type: "text" | "textarea" | "choice";
  choices?: { value: string; label: string }[];
  hint?: string;
}

/** A selectable growth goal (shown in onboarding, drives the weekly cycle). */
export interface GoalOption {
  key: string;
  label: string;
}

export type ContentRole = "EDUCATIONAL" | "AUTHORITY" | "TRUST" | "CONVERSION";
export type ContentFormat = "REEL" | "CAROUSEL" | "STATIC";
export type ContentPlatform =
  | "INSTAGRAM"
  | "FACEBOOK"
  | "TIKTOK"
  | "LINKEDIN"
  | "YOUTUBE";

/** A short video script for Reel/TikTok items. */
export interface VideoScriptSeed {
  hook: string;
  beats: string[];
  onScreenText: string[];
  cta: string;
  durationSec: number;
}

/**
 * A ready content seed the engine composes into a PlanItem. In V1 these provide
 * the (Hebrew) substance for the mock/demo path; the same shape is what the AI
 * pipeline produces when generating dynamically.
 */
export interface ContentSeed {
  topic: string;
  pillar: string;
  role: ContentRole;
  format: ContentFormat;
  platform: ContentPlatform;
  goalKey: string;
  hook: string;
  caption: string;
  description?: string;
  cta: string;
  hashtags: string[];
  rationale: string;
  script?: VideoScriptSeed;
}

/** A weekly market-research read the plan is built on. */
export interface WeeklyResearch {
  summary: string;
  trends: string[];
  topics: string[];
  recommendation: string;
}

/** The vertical's content substance the generic engine draws from. */
export interface VerticalContent {
  /** BCP-47-ish locale, e.g. "he" or "en". */
  locale: string;
  goals: GoalOption[];
  pillars: { key: string; label: string }[];
  research: WeeklyResearch;
  seeds: ContentSeed[];
}

export interface Vertical {
  key: string;
  label: string;
  primaryGoalLabel: string;

  contentPersona: string;
  contentGuidance: string;

  onboardingQuestions: OnboardingQuestion[];

  /** Goals, pillars, weekly research, and content seeds for the engine. */
  content: VerticalContent;

  contributeSuggestions?(input: {
    env: Env;
    business: Business;
  }): Promise<Suggestion[]>;
}
