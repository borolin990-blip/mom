import type { GenerateContentPlanInput } from "../provider.interface";
import { PLATFORMS } from "../schemas/content-plan";

/**
 * Versioned prompt registry.
 *
 * Prompts are product assets, not throwaway strings. Versioning them lets us
 * evolve the engine, compare quality, and (later) A/B test without code
 * changes leaking into business logic. The stored `model` + this version give
 * us auditability of how any piece of content was produced.
 */
export const CONTENT_PLAN_PROMPT_VERSION = "content-plan/v1";

interface ChatMessages {
  system: string;
  user: string;
}

function describeBusiness(input: GenerateContentPlanInput): string {
  const { business } = input;
  const lines = [
    `Business name: ${business.name}`,
    `Industry: ${business.industry}`,
    business.targetAudience ? `Target audience: ${business.targetAudience}` : null,
    business.brandTone ? `Brand tone: ${business.brandTone}` : null,
    business.goals.length ? `Primary goals: ${business.goals.join(", ")}` : null,
    business.description ? `About: ${business.description}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

function describeAsset(input: GenerateContentPlanInput): string {
  const { asset } = input;
  const lines = [
    `Content type: ${asset.type}`,
    asset.originalName ? `File: ${asset.originalName}` : null,
    asset.contextNote
      ? `Creator's note about this content: ${asset.contextNote}`
      : `Creator's note: (none provided — infer from the business context)`,
  ].filter(Boolean);
  return lines.join("\n");
}

/**
 * Build the chat messages for a content-plan generation. The system prompt
 * pins the persona + the exact JSON contract; the user prompt supplies the
 * specific business + asset context.
 */
export function buildContentPlanMessages(
  input: GenerateContentPlanInput,
): ChatMessages {
  const variationCount = input.variationCount ?? 2;

  const system = [
    "You are an expert social media marketing strategist for small businesses.",
    "Your single objective: help the business owner get more leads with less effort.",
    "You write copy that is specific, credible, and human — never generic or spammy.",
    "You adapt tone and vocabulary to the business's industry and audience.",
    "",
    "Return ONLY a JSON object with EXACTLY this shape:",
    "{",
    '  "analysis": {',
    '    "summary": string,            // 1-2 sentences on what the content is',
    '    "topics": string[],           // key themes',
    '    "detectedTone": string,',
    '    "suggestedContentType": string',
    "  },",
    '  "category": string,             // e.g. "Educational", "Testimonial", "Promotional"',
    `  "platformHint": one of ${PLATFORMS.map((p) => `"${p}"`).join(" | ")},`,
    '  "primary": Variation,',
    `  "variations": Variation[]       // exactly ${variationCount} alternative angles`,
    "}",
    "where Variation = {",
    '  "hook": string,                 // scroll-stopping first line',
    '  "caption": string,              // full post body',
    '  "description": string,          // longer description',
    '  "cta": string,                  // clear lead-generating call to action',
    '  "hashtags": string[]            // WITHOUT the leading #',
    "}",
    "Do not include markdown, code fences, or commentary — JSON only.",
  ].join("\n");

  const user = [
    "BUSINESS CONTEXT",
    describeBusiness(input),
    "",
    "CONTENT TO WORK WITH",
    describeAsset(input),
    "",
    `Produce the content plan now with ${variationCount} alternative variations.`,
  ].join("\n");

  return { system, user };
}
