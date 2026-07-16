import {
  prisma,
  type GeneratedContent,
  type Platform,
  type Prisma,
} from "@mom/db";
import type { Env } from "@mom/config";
import { getAIProvider, type ContentPlan, type ContentVariation } from "../ai";
import { toBusinessContext } from "./business.service";
import { resolveVerticalForBusiness } from "../verticals/registry";

/**
 * The core product workflow: turn an uploaded asset + business profile into a
 * complete, persisted AI content plan (analysis + primary post + alternatives).
 *
 * This service owns the orchestration; the actual generation is delegated to
 * whichever AIProvider is configured. It never imports a specific model/vendor.
 */

export interface GenerationResult {
  plan: ContentPlan;
  primary: GeneratedContent;
  variations: GeneratedContent[];
}

/**
 * Generate (or re-generate) the content plan for an asset. Previous generations
 * for the asset are replaced so the review screen always shows the latest plan.
 */
export async function generateForAsset(
  env: Env,
  assetId: string,
  businessId: string,
): Promise<GenerationResult> {
  const asset = await prisma.contentAsset.findFirst({
    where: { id: assetId, businessId },
    include: { business: true },
  });
  if (!asset) throw new Error("Asset not found.");

  const provider = getAIProvider(env);
  const vertical = resolveVerticalForBusiness(asset.business);

  await prisma.contentAsset.update({
    where: { id: asset.id },
    data: { status: "ANALYZING" },
  });

  let plan: ContentPlan;
  try {
    plan = await provider.generateContentPlan({
      business: toBusinessContext(asset.business),
      asset: {
        type: asset.type,
        originalName: asset.originalName,
        contextNote: asset.contextNote,
      },
      variationCount: 2,
      persona: vertical.contentPersona,
      guidance: vertical.contentGuidance,
    });
  } catch (err) {
    await prisma.contentAsset.update({
      where: { id: asset.id },
      data: { status: "FAILED" },
    });
    throw err;
  }

  // Persist atomically: clear old generations, write analysis + new ones.
  const saved = await prisma.$transaction(async (tx) => {
    await tx.generatedContent.deleteMany({ where: { assetId: asset.id } });

    const primary = await tx.generatedContent.create({
      data: variationToRow(plan.primary, {
        assetId: asset.id,
        version: 1,
        isPrimary: true,
        category: plan.category,
        platformHint: plan.platformHint,
        model: provider.model,
        raw: plan as unknown as Prisma.InputJsonValue,
      }),
    });

    const variations: GeneratedContent[] = [];
    for (let i = 0; i < plan.variations.length; i++) {
      const row = await tx.generatedContent.create({
        data: variationToRow(plan.variations[i]!, {
          assetId: asset.id,
          version: i + 2,
          isPrimary: false,
          category: plan.category,
          platformHint: plan.platformHint,
          model: provider.model,
          raw: null,
        }),
      });
      variations.push(row);
    }

    await tx.contentAsset.update({
      where: { id: asset.id },
      data: {
        status: "GENERATED",
        analysis: plan.analysis as unknown as Prisma.InputJsonValue,
      },
    });

    return { primary, variations };
  });

  return { plan, primary: saved.primary, variations: saved.variations };
}

/** Load the persisted generations for an asset, primary first. */
export async function getGenerations(
  assetId: string,
): Promise<GeneratedContent[]> {
  return prisma.generatedContent.findMany({
    where: { assetId },
    orderBy: [{ isPrimary: "desc" }, { version: "asc" }],
  });
}

// --------------------------------------------------------------------------

interface RowMeta {
  assetId: string;
  version: number;
  isPrimary: boolean;
  category: string;
  platformHint: Platform;
  model: string;
  raw: Prisma.InputJsonValue | null;
}

function variationToRow(
  v: ContentVariation,
  meta: RowMeta,
): Prisma.GeneratedContentUncheckedCreateInput {
  return {
    assetId: meta.assetId,
    version: meta.version,
    isPrimary: meta.isPrimary,
    hook: v.hook,
    caption: v.caption,
    description: v.description,
    cta: v.cta,
    hashtags: v.hashtags,
    category: meta.category,
    platformHint: meta.platformHint,
    model: meta.model,
    ...(meta.raw !== null ? { raw: meta.raw } : {}),
  };
}
