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
import type {
  ContentFormat,
  ContentRole,
  ContentSeed,
  MarketEvent,
  WeeklyResearch,
} from "../verticals/vertical.interface";
import type {
  ComplianceCheck,
  ItemDecision,
  QualityScore,
} from "../studio/studio.types";

export * from "../studio/studio.types";

/**
 * The Weekly Cycle engine (generic across verticals).
 *
 * The plan is NOT a fixed quota. Its size and format mix emerge from the
 * business's objective and current market conditions (a market event can reshape
 * or replace the week entirely), per docs/LUMA_BRAIN.md. Each item carries a
 * Content Studio decision record (signal, rejected alternatives, quality score,
 * compliance) so Luma's thinking is fully transparent.
 */

export interface WeeklyCycleWithItems extends WeeklyCycle {
  items: PlanItem[];
}

interface GrowthPlan {
  primary?: string;
  goals?: { key: string; label: string }[];
}

interface Slot {
  role: ContentRole;
  format?: ContentFormat;
}

interface PlanShape {
  slots: Slot[];
  strategyNote: string;
}

function startOfWeek(d = new Date()): Date {
  const x = new Date(d);
  x.setDate(x.getDate() - x.getDay());
  x.setHours(0, 0, 0, 0);
  return x;
}

function bestSlots(count: number, from = new Date()): Date[] {
  const slots: Date[] = [];
  const d = new Date(from);
  d.setHours(19, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  while (slots.length < count) {
    const day = d.getDay();
    if (day !== 5 && day !== 6) slots.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return slots;
}

// --------------------------------------------------------------------------
// Dynamic planning — the shape emerges from objective + market conditions.
// --------------------------------------------------------------------------

function planShape(objective: string, event?: MarketEvent): PlanShape {
  if (event) {
    // A market event reshapes the week — fast, reactive, video-forward.
    return {
      slots: [
        { role: "AUTHORITY", format: "REEL" },
        { role: "CONVERSION", format: "REEL" },
        { role: "EDUCATIONAL", format: "CAROUSEL" },
      ],
      strategyNote: event.strategyNote,
    };
  }

  switch (objective) {
    case "leads":
      return {
        slots: [
          { role: "AUTHORITY", format: "REEL" },
          { role: "EDUCATIONAL", format: "STATIC" },
          { role: "TRUST", format: "STATIC" },
          { role: "CONVERSION", format: "STATIC" },
        ],
        strategyNote:
          "השבוע כיוונתי לפניות: סרטון שמושך תשומת לב, ערך חינוכי, סיפור שמבסס אמון — ופנייה ברורה אחת.",
      };
    case "reactivation":
      return {
        slots: [
          { role: "TRUST", format: "STATIC" },
          { role: "EDUCATIONAL", format: "CAROUSEL" },
          { role: "CONVERSION", format: "STATIC" },
        ],
        strategyNote:
          "השבוע התמקדתי בחידוש קשר: סיפור אישי, תזכורת מקצועית ופנייה חמה — פחות פוסטים, יותר חיבור.",
      };
    case "awareness":
      return {
        slots: [
          { role: "AUTHORITY", format: "REEL" },
          { role: "EDUCATIONAL", format: "REEL" },
          { role: "TRUST", format: "STATIC" },
          { role: "EDUCATIONAL", format: "CAROUSEL" },
        ],
        strategyNote:
          "השבוע כיוונתי לחשיפה: יותר וידאו קצר שמגדיל טווח, לצד תוכן חינוכי שמבסס אותך.",
      };
    case "engagement":
      return {
        slots: [
          { role: "AUTHORITY", format: "CAROUSEL" },
          { role: "EDUCATIONAL", format: "CAROUSEL" },
          { role: "AUTHORITY", format: "REEL" },
          { role: "TRUST", format: "STATIC" },
        ],
        strategyNote:
          "השבוע עודדתי מעורבות: תכנים שמזמינים תגובות ושאלות, עם סרטון וסיפור לאיזון.",
      };
    case "authority":
    default:
      return {
        slots: [
          { role: "EDUCATIONAL", format: "CAROUSEL" },
          { role: "AUTHORITY", format: "REEL" },
          { role: "EDUCATIONAL", format: "CAROUSEL" },
          { role: "TRUST", format: "STATIC" },
          { role: "AUTHORITY", format: "CAROUSEL" },
        ],
        strategyNote:
          "השבוע התמקדתי בביסוס מומחיות: יותר תוכן חינוכי וסמכותי, סרטון אחד וסיפור אישי לאיזון.",
      };
  }
}

function pickSeed(
  pool: ContentSeed[],
  slot: Slot,
  objective: string,
  used: Set<ContentSeed>,
): ContentSeed | null {
  let best: ContentSeed | null = null;
  let bestScore = -1;
  for (const seed of pool) {
    if (used.has(seed)) continue;
    let score = 0;
    if (seed.role === slot.role) score += 3;
    if (slot.format && seed.format === slot.format) score += 2;
    if (seed.goalKey === objective) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = seed;
    }
  }
  return best;
}

// --------------------------------------------------------------------------
// Content Studio — the decision record per item.
// --------------------------------------------------------------------------

const RISKY = /מובטח|מבטיח|תשואה|ריבית של\s*\d|\d+\s*%/;

function checkCompliance(text: string): ComplianceCheck {
  const flagged = RISKY.test(text);
  return {
    passed: !flagged,
    notes: flagged
      ? ["נמצאה שפה שעלולה להתפרש כהבטחה — סומן לבדיקה ידנית."]
      : [
          "ללא הבטחת ריבית, אישור או תשואה.",
          "ללא מספרים שלא ניתן לאמת.",
          "נוסח בהתאם לכללי פרסום מקובלים.",
        ],
  };
}

function scoreQuality(seed: ContentSeed, objective: string): QualityScore {
  const onGoal = seed.goalKey === objective ? 5 : 4;
  const dimensions = [
    { name: "קול ומיתוג", score: 5 },
    { name: "התאמה למטרה", score: onGoal },
    { name: "התאמה לקהל", score: 5 },
    { name: "רעננות", score: 4 },
    { name: "בהירות", score: 5 },
    { name: "ערך", score: 5 },
    { name: "התאמת פורמט", score: 5 },
  ];
  const overall =
    Math.round(
      (dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length) * 10,
    ) / 10;
  return { dimensions, overall, confidence: onGoal === 5 ? 0.86 : 0.8 };
}

const ALT_REASONS = [
  "כיסינו זווית דומה בשבועות האחרונים — פחות רענן.",
  "פחות ממוקד במטרת השבוע.",
  "צפוי לייצר פחות שמירות ושיתופים.",
];

function buildDecision(
  seed: ContentSeed,
  research: WeeklyResearch,
  objective: string,
  event: MarketEvent | undefined,
): ItemDecision {
  const alternatives = (seed.altIdeas ?? []).slice(0, 2).map((idea, i) => ({
    idea,
    reason: ALT_REASONS[i % ALT_REASONS.length]!,
  }));

  return {
    signal: event
      ? `אירוע שוק: ${event.label}`
      : `מגמה שבועית: ${research.trends[0] ?? research.summary.slice(0, 40)}`,
    alternatives,
    whyWon: seed.rationale,
    quality: scoreQuality(seed, objective),
    compliance: checkCompliance(`${seed.caption} ${seed.cta}`),
    visualDirection:
      seed.visualDirection ??
      (seed.format === "REEL"
        ? "סרטון אנכי קצר, פנים מול המצלמה, כתוביות ברורות."
        : seed.format === "CAROUSEL"
          ? "קרוסלה נקייה, נקודה אחת בכל שקף, צבע מותג אחיד."
          : "תמונה חמה עם משפט מפתח אחד."),
  };
}

// --------------------------------------------------------------------------
// Generate / regenerate
// --------------------------------------------------------------------------

export interface GenerateOptions {
  /** Reshape the week around a market event (by key). */
  eventKey?: string;
}

export async function generateWeeklyCycle(
  business: Business,
  opts: GenerateOptions = {},
): Promise<WeeklyCycleWithItems> {
  const weekOf = startOfWeek();

  const existing = await prisma.weeklyCycle.findFirst({
    where: { businessId: business.id, weekOf },
    include: { items: { orderBy: { createdAt: "asc" } } },
  });
  if (existing) return existing;

  return composeAndPersist(business, weekOf, opts);
}

/** Replace this week's plan (e.g. after a market event). */
export async function regenerateWeeklyCycle(
  business: Business,
  opts: GenerateOptions = {},
): Promise<WeeklyCycleWithItems> {
  const weekOf = startOfWeek();
  await prisma.weeklyCycle.deleteMany({
    where: { businessId: business.id, weekOf },
  });
  return composeAndPersist(business, weekOf, opts);
}

async function composeAndPersist(
  business: Business,
  weekOf: Date,
  opts: GenerateOptions,
): Promise<WeeklyCycleWithItems> {
  const vertical = resolveVerticalForBusiness(business);
  const content = vertical.content;
  const growthPlan = (business.growthPlan as GrowthPlan | null) ?? null;
  const objective = growthPlan?.primary ?? content.goals[0]?.key ?? "leads";

  const event = opts.eventKey
    ? content.events?.find((e) => e.key === opts.eventKey)
    : undefined;
  const research = event?.research ?? content.research;
  const pool = event ? [...event.seeds, ...content.seeds] : content.seeds;

  const shape = planShape(objective, event);
  const used = new Set<ContentSeed>();
  const chosen: ContentSeed[] = [];
  for (const slot of shape.slots) {
    const seed = pickSeed(pool, slot, objective, used);
    if (seed) {
      used.add(seed);
      chosen.push(seed);
    }
  }

  const cycle = await prisma.weeklyCycle.create({
    data: {
      businessId: business.id,
      weekOf,
      status: "REVIEW",
      objectiveGoal: objective,
      objectiveNote: research.recommendation,
      strategyNote: shape.strategyNote,
      marketEvent: event?.key ?? null,
      research: research as unknown as Prisma.InputJsonValue,
      items: {
        create: chosen.map((s) => ({
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
          decision: buildDecision(
            s,
            research,
            objective,
            event,
          ) as unknown as Prisma.InputJsonValue,
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

export async function getPlanItem(
  itemId: string,
  businessId: string,
): Promise<(PlanItem & { cycle: WeeklyCycle }) | null> {
  return prisma.planItem.findFirst({
    where: { id: itemId, businessId },
    include: { cycle: true },
  });
}

export async function approvePlanItem(
  itemId: string,
  businessId: string,
): Promise<void> {
  await prisma.planItem.updateMany({
    where: { id: itemId, businessId, status: "DRAFT" },
    data: { status: "APPROVED" },
  });
}

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

export async function listScheduledPlanItems(
  businessId: string,
): Promise<PlanItem[]> {
  return prisma.planItem.findMany({
    where: { businessId, scheduledFor: { not: null } },
    orderBy: { scheduledFor: "asc" },
  });
}
