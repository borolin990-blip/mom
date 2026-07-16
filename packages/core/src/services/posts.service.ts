import { prisma, Platform, type Post } from "@mom/db";
import { recommendPostTime } from "../scheduling/best-time";

/** Coerce a stored platform hint into a valid Platform enum value. */
function toPlatform(value: string | null): Platform {
  const values = Object.values(Platform) as string[];
  return (value && values.includes(value) ? value : "INSTAGRAM") as Platform;
}

/**
 * Scheduling use-cases. In Phase 1 a "scheduled" post is a committed plan on the
 * calendar; actual publishing arrives in Phase 2 (the Post model + statuses are
 * already shaped for it).
 */

/** Add a generated post to the calendar at a chosen (or AI-recommended) time. */
export async function schedulePost(params: {
  businessId: string;
  assetId: string;
  generationId: string;
  at?: Date;
}): Promise<Post> {
  const generation = await prisma.generatedContent.findFirstOrThrow({
    where: { id: params.generationId, asset: { businessId: params.businessId } },
  });

  const scheduledFor = params.at ?? recommendPostTime().at;

  return prisma.post.create({
    data: {
      businessId: params.businessId,
      assetId: params.assetId,
      generationId: params.generationId,
      platform: toPlatform(generation.platformHint),
      caption: generation.caption,
      status: "SCHEDULED",
      scheduledFor,
    },
  });
}

export async function listPosts(businessId: string): Promise<Post[]> {
  return prisma.post.findMany({
    where: { businessId },
    orderBy: [{ scheduledFor: "asc" }, { createdAt: "desc" }],
  });
}

/** Posts with a scheduled date, for the calendar view. */
export async function listScheduledPosts(businessId: string): Promise<Post[]> {
  return prisma.post.findMany({
    where: { businessId, scheduledFor: { not: null } },
    orderBy: { scheduledFor: "asc" },
  });
}
