import { prisma, type Business } from "@mom/db";
import type { BusinessContext } from "../ai/provider.interface";
import type { BusinessKnowledge } from "../ai/schemas/knowledge";

/**
 * Business/tenant resolution.
 *
 * Auth is intentionally simple in Phase 1: the app operates on a single
 * "active" business (the seeded demo). This function is the seam where real
 * auth plugs in later — it will read the session's workspace/business instead
 * of falling back to the first one. UI and services never assume how the active
 * business is chosen; they just call getActiveBusiness().
 */
export async function getActiveBusiness(): Promise<Business> {
  const existing = await prisma.business.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;

  // Bootstrap a workspace + business so the app is usable on a fresh database
  // even before onboarding exists. Replaced by real onboarding in a later phase.
  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo" },
    update: {},
    create: { name: "Demo Workspace", slug: "demo" },
  });

  return prisma.business.create({
    data: {
      workspaceId: workspace.id,
      name: "Your Business",
      industry: "small_business",
      goals: ["leads"],
    },
  });
}

/** Map a persisted Business into the context the AI engine consumes. */
export function toBusinessContext(business: Business): BusinessContext {
  const knowledge = (business.knowledge as BusinessKnowledge | null) ?? null;
  return {
    name: business.name,
    industry: business.industry,
    targetAudience: business.targetAudience,
    brandTone: business.brandTone,
    goals: business.goals,
    description: business.description,
    knowledgeSummary: knowledge?.summary ?? null,
    topics: knowledge?.topics ?? null,
  };
}
