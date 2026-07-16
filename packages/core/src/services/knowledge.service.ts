import { prisma, type Business, type Prisma } from "@mom/db";
import type { Env } from "@mom/config";
import { getAIProvider, type BusinessKnowledge } from "../ai";

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
