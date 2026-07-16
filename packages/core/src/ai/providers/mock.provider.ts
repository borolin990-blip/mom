import type {
  AIProvider,
  GenerateContentPlanInput,
  BusinessContext,
} from "../provider.interface";
import {
  type ContentPlan,
  type ContentVariation,
  type PlatformHint,
  contentPlanSchema,
} from "../schemas/content-plan";

/**
 * Deterministic, dependency-free AI provider.
 *
 * This is NOT a placeholder that returns lorem ipsum — it produces plausible,
 * business-aware marketing copy driven by the business profile and the user's
 * context note. It lets the entire product be demoed and developed with no API
 * key, and it doubles as a safe default and a test oracle. Swap in the OpenAI
 * provider by setting AI_PROVIDER=openai.
 */
export class MockAIProvider implements AIProvider {
  readonly name = "mock";
  readonly model = "mock-1";

  async generateContentPlan(
    input: GenerateContentPlanInput,
  ): Promise<ContentPlan> {
    const { business, asset } = input;
    const variationCount = Math.max(1, input.variationCount ?? 2);

    const topic = deriveTopic(business, asset.contextNote);
    const audience = business.targetAudience?.trim() || "your audience";
    const goal = primaryGoal(business.goals);
    const platformHint = pickPlatform(asset.type, business.industry);
    const baseHashtags = buildHashtags(business, topic);

    const angles = ANGLES.slice(0, variationCount + 1);
    const [primaryAngle, ...altAngles] = angles;

    const primary = buildVariation(
      primaryAngle!,
      { business, audience, goal, topic, baseHashtags },
    );
    const variations = altAngles.map((angle) =>
      buildVariation(angle, { business, audience, goal, topic, baseHashtags }),
    );

    const plan: ContentPlan = {
      analysis: {
        summary: `A ${asset.type.toLowerCase()} about ${topic} for ${business.name}, aimed at ${audience}.`,
        topics: [topic, business.industry.replace(/_/g, " "), goal.theme],
        detectedTone: business.brandTone?.trim() || "professional and approachable",
        suggestedContentType: primaryAngle!.contentType,
      },
      category: primaryAngle!.category,
      platformHint,
      primary,
      variations,
    };

    // Validate our own output against the shared contract, exactly like a real
    // provider would — so a bug here surfaces the same way as a bad model reply.
    return contentPlanSchema.parse(plan);
  }
}

// --------------------------------------------------------------------------
// Angle templates — each is a distinct marketing approach.
// --------------------------------------------------------------------------

interface Angle {
  category: string;
  contentType: string;
  hook: (topic: string) => string;
  body: (ctx: BuildCtx) => string;
}

interface BuildCtx {
  business: BusinessContext;
  audience: string;
  goal: Goal;
  topic: string;
  baseHashtags: string[];
}

const ANGLES: Angle[] = [
  {
    category: "Educational",
    contentType: "Value / how-to",
    hook: (t) => `The one thing most people get wrong about ${t}.`,
    body: (c) =>
      `If you're ${c.audience.toLowerCase()}, understanding ${c.topic} can save you time, stress, and money. ` +
      `Here's the clear, no-jargon breakdown — so you can make a confident decision.`,
  },
  {
    category: "Story",
    contentType: "Relatable narrative",
    hook: (t) => `I used to think ${t} was complicated. Here's what changed.`,
    body: (c) =>
      `Every week I talk to ${c.audience.toLowerCase()} who feel overwhelmed by ${c.topic}. ` +
      `It doesn't have to be that way. A few simple steps make the whole thing feel manageable.`,
  },
  {
    category: "Myth-busting",
    contentType: "Contrarian insight",
    hook: (t) => `Stop believing this myth about ${t}.`,
    body: (c) =>
      `There's a lot of bad advice out there about ${c.topic}. ` +
      `Let's clear it up so you can move forward with the facts, not the fear.`,
  },
  {
    category: "Testimonial",
    contentType: "Social proof",
    hook: (t) => `"I wish I'd understood ${t} sooner."`,
    body: (c) =>
      `That's what so many of ${c.audience.toLowerCase()} tell me after we work together on ${c.topic}. ` +
      `Real progress starts with one honest conversation.`,
  },
];

// --------------------------------------------------------------------------
// Goal → call-to-action mapping.
// --------------------------------------------------------------------------

interface Goal {
  key: string;
  theme: string;
  cta: (business: BusinessContext) => string;
}

const GOALS: Record<string, Goal> = {
  leads: {
    key: "leads",
    theme: "lead generation",
    cta: () => `👉 DM me "READY" and I'll send you a free personalized plan.`,
  },
  sales: {
    key: "sales",
    theme: "conversion",
    cta: () => `👉 Book your free consultation today — link in bio.`,
  },
  awareness: {
    key: "awareness",
    theme: "brand awareness",
    cta: () => `👉 Follow for straightforward tips you can actually use.`,
  },
};

function primaryGoal(goals: string[]): Goal {
  const found = goals.map((g) => GOALS[g.toLowerCase()]).find(Boolean);
  return found ?? GOALS.leads!;
}

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function buildVariation(angle: Angle, ctx: BuildCtx): ContentVariation {
  const hook = angle.hook(ctx.topic);
  const body = angle.body(ctx);
  const caption = `${hook}\n\n${body}\n\n${ctx.goal.cta(ctx.business)}`;
  const description =
    `${body} ` +
    `At ${ctx.business.name}, we help ${ctx.audience.toLowerCase()} with ${ctx.topic}. ` +
    `${ctx.goal.cta(ctx.business)}`;
  return {
    hook,
    caption,
    description,
    cta: ctx.goal.cta(ctx.business),
    hashtags: ctx.baseHashtags,
  };
}

function deriveTopic(
  business: BusinessContext,
  contextNote?: string | null,
): string {
  const note = contextNote?.trim();
  if (note) {
    // Use the first meaningful clause of the user's note as the topic.
    const clause = note.split(/[.!?\n]/)[0]?.trim();
    if (clause && clause.length > 3) return clause.toLowerCase();
  }
  return `${business.industry.replace(/_/g, " ")}`;
}

function pickPlatform(
  assetType: "VIDEO" | "IMAGE",
  industry: string,
): PlatformHint {
  const professional = /mortgage|law|legal|doctor|medical|finance|consult/i.test(
    industry,
  );
  if (assetType === "VIDEO") return professional ? "LINKEDIN" : "TIKTOK";
  return professional ? "LINKEDIN" : "INSTAGRAM";
}

function buildHashtags(business: BusinessContext, topic: string): string[] {
  const slug = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .split(/\s+/)
      .map((w, i) => (i === 0 ? w : w[0]!.toUpperCase() + w.slice(1)))
      .join("");

  const industryTag = slug(business.industry.replace(/_/g, " "));
  const topicTag = slug(topic);
  const goalTags = business.goals.map((g) => slug(`${g} tips`));

  return Array.from(
    new Set(
      [
        industryTag,
        topicTag,
        `${industryTag}Tips`,
        "smallBusiness",
        "localExpert",
        ...goalTags,
      ].filter((t) => t && t.length > 1),
    ),
  ).slice(0, 8);
}
