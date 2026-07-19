import {
  prisma,
  type Business,
  type PlanItem,
  type Platform,
  type PlanItemRole,
  type PlanFormat,
  type Prisma,
  type WeeklyCycle,
} from "@mom/db";
import { resolveVerticalForBusiness } from "../verticals/registry";
import type { ContentSeed } from "../verticals/vertical.interface";

/**
 * The Weekly Cycle engine (generic across verticals).
 *
 * Given a business, it reads the resolved Vertical's content substance and
 * composes a balanced weekly plan — a coherent mix of roles and formats aimed at
 * the business's primary goal, per docs/LUMA_BRAIN.md. V1 composes from the
 * vertical's content seeds (the simplified, deterministic path); the same output
 * shape is what the AI pipeline produces when generating dynamically.
 */

export interface WeeklyCycleWithItems extends WeeklyCycle {
  items: PlanItem[];
}

interface GrowthPlan {
  primary?: string;
  goals?: { key: string; label: string }[];
}

function startOfWeek(d = new Date()): Date {
  const x = new Date(d);
  x.setDate(x.getDate() - x.getDay()); // back to Sunday
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Upcoming Sun–Thu evening slots (Israeli week), one per day, skipping Fri/Sat. */
function bestSlots(count: number, from = new Date()): Date[] {
  const slots: Date[] = [];
  const d = new Date(from);
  d.setHours(19, 0, 0, 0);
  d.setDate(d.getDate() + 1); // start tomorrow
  while (slots.length < count) {
    const day = d.getDay();
    if (day !== 5 && day !== 6) slots.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return slots;
}

/** Pick a balanced, role-diverse set of seeds (with at least one video). */
function selectSeeds(seeds: ContentSeed[], max = 5): ContentSeed[] {
  const byRole = new Map<string, ContentSeed[]>();
  for (const s of seeds) {
    const arr = byRole.get(s.role) ?? [];
    arr.push(s);
    byRole.set(s.role, arr);
  }
  const pattern = ["EDUCATIONAL", "AUTHORITY", "TRUST", "AUTHORITY", "CONVERSION"];
  const cursor = new Map<string, number>();
  const picked: ContentSeed[] = [];
  for (const role of pattern) {
    if (picked.length >= max) break;
    const arr = byRole.get(role) ?? [];
    const i = cursor.get(role) ?? 0;
    if (arr[i]) {
      picked.push(arr[i]!);
      cursor.set(role, i + 1);
    }
  }
  // Fill from anything unused if we came up short.
  if (picked.length < max) {
    for (const s of seeds) {
      if (picked.length >= max) break;
      if (!picked.includes(s)) picked.push(s);
    }
  }
  // Guarantee a video in the week.
  if (!picked.some((p) => p.format === "REEL")) {
    const reel = seeds.find((s) => s.format === "REEL");
    if (reel && !picked.includes(reel)) picked[picked.length - 1] = reel;
  }
  return picked;
}

/** Generate (or return the existing) weekly cycle for the current week. */
export async function generateWeeklyCycle(
  business: Business,
): Promise<WeeklyCycleWithItems> {
  const weekOf = startOfWeek();

  const existing = await prisma.weeklyCycle.findFirst({
    where: { businessId: business.id, weekOf },
    include: { items: { orderBy: { createdAt: "asc" } } },
  });
  if (existing) return existing;

  const vertical = resolveVerticalForBusiness(business);
  const { research, seeds, goals } = vertical.content;
  const growthPlan = (business.growthPlan as GrowthPlan | null) ?? null;
  const objectiveGoal = growthPlan?.primary ?? goals[0]?.key ?? "leads";

  const selected = selectSeeds(seeds);

  const cycle = await prisma.weeklyCycle.create({
    data: {
      businessId: business.id,
      weekOf,
      status: "REVIEW",
      objectiveGoal,
      objectiveNote: research.recommendation,
      research: research as unknown as Prisma.InputJsonValue,
      items: {
        create: selected.map((s) => ({
          businessId: business.id,
          role: s.role as PlanItemRole,
          format: s.format as PlanFormat,
          platform: s.platform as Platform,
          topic: s.topic,
          hook: s.hook,
          caption: s.caption,
          description: s.description ?? null,
          cta: s.cta,
          hashtags: s.hashtags,
          goal: s.goalKey,
          rationale: s.rationale,
          status: "DRAFT" as const,
          ...(s.script
            ? { videoScript: s.script as unknown as Prisma.InputJsonValue }
            : {}),
        })),
      },
    },
    include: { items: { orderBy: { createdAt: "asc" } } },
  });

  return cycle;
}

export async function getCurrentCycle(
  businessId: string,
): Promise<WeeklyCycleWithItems | null> {
  return prisma.weeklyCycle.findFirst({
    where: { businessId },
    orderBy: { weekOf: "desc" },
    include: { items: { orderBy: { createdAt: "asc" } } },
  });
}

/** Approve a single plan item. */
export async function approvePlanItem(
  itemId: string,
  businessId: string,
): Promise<void> {
  await prisma.planItem.updateMany({
    where: { id: itemId, businessId, status: "DRAFT" },
    data: { status: "APPROVED" },
  });
}

/** Approve everything still pending and schedule the week across good slots. */
export async function approveAndScheduleCycle(
  cycleId: string,
  businessId: string,
): Promise<WeeklyCycleWithItems | null> {
  const items = await prisma.planItem.findMany({
    where: { cycleId, businessId },
    orderBy: { createdAt: "asc" },
  });
  const slots = bestSlots(items.length);

  await prisma.$transaction([
    ...items.map((it, i) =>
      prisma.planItem.update({
        where: { id: it.id },
        data: { status: "SCHEDULED", scheduledFor: slots[i] },
      }),
    ),
    prisma.weeklyCycle.update({
      where: { id: cycleId },
      data: { status: "SCHEDULED" },
    }),
  ]);

  return getCurrentCycle(businessId);
}

/** Scheduled items for the calendar. */
export async function listScheduledPlanItems(
  businessId: string,
): Promise<PlanItem[]> {
  return prisma.planItem.findMany({
    where: { businessId, scheduledFor: { not: null } },
    orderBy: { scheduledFor: "asc" },
  });
}
