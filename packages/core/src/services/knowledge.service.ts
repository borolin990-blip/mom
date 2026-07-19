import { prisma, type Business, type Prisma } from "@mom/db";
import type { Env } from "@mom/config";
import { getAIProvider, type BusinessKnowledge } from "../ai";
import { resolveVertical } from "../verticals/registry";

/**
 * Onboarding & Business Knowledge Profile.
 *
 * Embodies "tell me a little, I'll learn the rest": a few answers (+ optional
 * links) in, a rich profile out — which the AI then grounds all content in and
 * keeps improving over time.
 */

export interface OnboardingInput {
  whatWeDo: string;
  idealCustomer?: string;
  goal?: string; // "leads" | "sales" | "awareness" (free text tolerated)
  links?: {
    website?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
}

const GOAL_MAP: Record<string, string> = {
  leads: "leads",
  sales: "sales",
  awareness: "awareness",
};

function normalizeGoal(goal?: string): string[] {
  if (!goal) return ["leads"];
  const key = goal.toLowerCase();
  const match = Object.keys(GOAL_MAP).find((g) => key.includes(g));
  return [match ?? "leads"];
}

/**
 * Run onboarding for the active business: derive a knowledge profile via the AI
 * provider and persist everything. Idempotent — can be re-run to refine.
 */
export async function completeOnboarding(
  env: Env,
  businessId: string,
  input: OnboardingInput,
): Promise<Business> {
  const provider = getAIProvider(env);
  const business = await prisma.business.findUniqueOrThrow({
    where: { id: businessId },
  });

  const knowledge = await provider.generateBusinessKnowledge({
    name: business.name,
    whatWeDo: input.whatWeDo,
    idealCustomer: input.idealCustomer,
    goal: input.goal,
    links: input.links,
  });

  return prisma.business.update({
    where: { id: businessId },
    data: {
      description: input.whatWeDo.trim(),
      targetAudience: input.idealCustomer?.trim() || knowledge.audience,
      brandTone: knowledge.tone,
      goals: normalizeGoal(input.goal),
      websiteUrl: input.links?.website?.trim() || null,
      instagramUrl: input.links?.instagram?.trim() || null,
      facebookUrl: input.links?.facebook?.trim() || null,
      linkedinUrl: input.links?.linkedin?.trim() || null,
      knowledge: knowledge as unknown as Prisma.InputJsonValue,
      onboardedAt: new Date(),
    },
  });
}

/** Read the persisted knowledge profile (typed), if the business has one. */
export function getKnowledge(business: Business): BusinessKnowledge | null {
  return (business.knowledge as BusinessKnowledge | null) ?? null;
}

export function isOnboarded(business: Business): boolean {
  return business.onboardedAt != null;
}

// --------------------------------------------------------------------------
// Onboarding — sets the Growth Plan + a locale-aware knowledge profile, no AI
// call (keeps the demo on-locale). Generic across verticals.
// --------------------------------------------------------------------------

export interface OnboardInput {
  businessName?: string;
  whatWeDo: string;
  idealCustomer?: string;
  /** Goal keys; the first is the primary objective. */
  goals: string[];
  tone?: string;
  verticalKey?: string;
}

function buildKnowledge(
  locale: string,
  input: OnboardInput,
  pillars: string[],
): BusinessKnowledge {
  if (locale === "he") {
    return {
      summary: `${sentence(input.whatWeDo)}${
        input.idealCustomer ? ` בדגש על ${input.idealCustomer}.` : "."
      }`,
      services: pillars,
      audience: input.idealCustomer?.trim() || "לקוחות מקומיים",
      tone: input.tone?.trim() || "מקצועי, חם ואמין",
      painPoints: [
        "בלבול מול ריבוי אפשרויות",
        "חשש מהחלטה כספית שגויה",
        "חוסר ידע על התהליך",
      ],
      topics: pillars,
      writingStyle: "משפטים ברורים ונגישים, בגוף ראשון, בנימה ידידותית",
      ctaStyle: "הזמנה עדינה להתייעצות אישית",
    };
  }
  return {
    summary: `${sentence(input.whatWeDo)}${
      input.idealCustomer ? ` Focused on ${input.idealCustomer}.` : "."
    }`,
    services: pillars,
    audience: input.idealCustomer?.trim() || "local customers",
    tone: input.tone?.trim() || "professional, warm, trustworthy",
    painPoints: [
      "Overwhelmed by options",
      "Worried about an expensive mistake",
      "Unsure how the process works",
    ],
    topics: pillars,
    writingStyle: "clear, jargon-free, first person, friendly",
    ctaStyle: "a soft invitation to talk",
  };
}

function sentence(s: string): string {
  const t = s.trim().replace(/[.\s]+$/, "");
  return t.charAt(0).toUpperCase() + t.slice(1) + ".";
}

/** Complete onboarding: Growth Plan + knowledge + vertical binding. */
export async function onboardBusiness(
  businessId: string,
  input: OnboardInput,
): Promise<Business> {
  const vertical = resolveVertical(input.verticalKey);
  const goalOptions = vertical.content.goals;
  const chosen = input.goals.length ? input.goals : [goalOptions[0]!.key];
  const growthGoals = chosen.map(
    (k) => goalOptions.find((g) => g.key === k) ?? { key: k, label: k },
  );
  const knowledge = buildKnowledge(
    vertical.content.locale,
    input,
    vertical.content.pillars.map((p) => p.label),
  );

  return prisma.business.update({
    where: { id: businessId },
    data: {
      ...(input.businessName?.trim() ? { name: input.businessName.trim() } : {}),
      verticalKey: vertical.key,
      description: input.whatWeDo.trim(),
      targetAudience: input.idealCustomer?.trim() || knowledge.audience,
      brandTone: input.tone?.trim() || knowledge.tone,
      goals: chosen,
      growthPlan: {
        primary: chosen[0],
        goals: growthGoals,
      } as unknown as Prisma.InputJsonValue,
      knowledge: knowledge as unknown as Prisma.InputJsonValue,
      onboardedAt: new Date(),
    },
  });
}
