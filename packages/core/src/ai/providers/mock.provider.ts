import type {
  AIProvider,
  BuildKnowledgeInput,
  BusinessContext,
  ContentIdeasInput,
  GenerateContentPlanInput,
} from "../provider.interface";
import {
  type ContentPlan,
  type ContentVariation,
  type PlatformHint,
  contentPlanSchema,
} from "../schemas/content-plan";
import {
  type BusinessKnowledge,
  businessKnowledgeSchema,
} from "../schemas/knowledge";
import { type ContentIdea, contentIdeasSchema } from "../schemas/ideas";

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

  async generateBusinessKnowledge(
    input: BuildKnowledgeInput,
  ): Promise<BusinessKnowledge> {
    const audience = input.idealCustomer?.trim() || "local customers";
    const goal = (input.goal ?? "leads").toLowerCase();
    const doing = input.whatWeDo.trim();

    const knowledge: BusinessKnowledge = {
      summary: `${input.name} serves ${audience.toLowerCase()}. ${sentenceCase(doing)}. The focus is ${goalTheme(goal)}, communicated with clarity and warmth.`,
      services: splitToList(doing),
      audience,
      tone: "professional, warm, and trustworthy",
      painPoints: [
        `Feeling overwhelmed by ${topicFromDoing(doing)}`,
        "Not knowing where to start",
        "Worrying about making an expensive mistake",
      ],
      topics: [
        topicFromDoing(doing),
        "common questions",
        "myths and mistakes to avoid",
        "client success stories",
      ],
      writingStyle: "clear, jargon-free sentences with a confident, friendly tone",
      ctaStyle:
        goal === "sales"
          ? "invite them to book a consultation"
          : goal === "awareness"
            ? "invite them to follow for more tips"
            : "invite them to reach out for a free personalized plan",
    };

    return businessKnowledgeSchema.parse(knowledge);
  }

  async generateContentIdeas(
    input: ContentIdeasInput,
  ): Promise<ContentIdea[]> {
    const count = Math.max(1, input.count ?? 5);
    const topic =
      input.knowledge?.topics[0] ??
      input.business.industry.replace(/_/g, " ");
    const audience =
      input.knowledge?.audience ??
      input.business.targetAudience ??
      "your audience";

    const seeds: ContentIdea[] = [
      {
        title: `3 things to know about ${topic}`,
        angle: `A quick, reassuring explainer for ${audience.toLowerCase()}.`,
        format: "Short video",
        why: "Educational posts build trust and tend to attract new leads.",
      },
      {
        title: "Behind the scenes of a real client win",
        angle: "Tell a short, human story of a recent success.",
        format: "Personal story",
        why: "Story posts create connection — you should share one this week.",
      },
      {
        title: `The biggest myth about ${topic}`,
        angle: "Bust a common misconception your customers believe.",
        format: "Carousel",
        why: "Myth-busting carousels get strong saves and shares.",
      },
      {
        title: "Answering the question I get most",
        angle: `Address the #1 thing ${audience.toLowerCase()} ask about.`,
        format: "Quick tip",
        why: "Answering real questions positions you as the go-to expert.",
      },
      {
        title: "A day in the life",
        angle: "Show how you help people, simply and authentically.",
        format: "Short video",
        why: "Face-to-camera content boosts reach and familiarity.",
      },
    ];

    return contentIdeasSchema.parse(loop(seeds, count));
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
  assetType: "VIDEO" | "IMAGE" | "IDEA",
  industry: string,
): PlatformHint {
  const professional = /mortgage|law|legal|doctor|medical|finance|consult/i.test(
    industry,
  );
  if (assetType === "VIDEO") return professional ? "LINKEDIN" : "TIKTOK";
  return professional ? "LINKEDIN" : "INSTAGRAM";
}

// -- knowledge/idea helpers ------------------------------------------------

function sentenceCase(s: string): string {
  const t = s.trim().replace(/[.\s]+$/, "");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function goalTheme(goal: string): string {
  if (goal.includes("sale")) return "turning interest into booked clients";
  if (goal.includes("aware")) return "growing a recognizable, trusted presence";
  return "generating qualified leads";
}

function splitToList(doing: string): string[] {
  const parts = doing
    .split(/,| and | & |\/|;/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
  return parts.length ? parts.slice(0, 5) : [doing.trim()];
}

function topicFromDoing(doing: string): string {
  let t = doing.trim().toLowerCase();
  // Drop a leading "I/we help <audience> get/with…" preamble so the topic reads
  // as a noun phrase ("mortgages") rather than a full sentence.
  t = t.replace(
    /^(i|we|our team|my business)\s+(help|assist|serve|work with|support)\s+[a-z\s-]+?\b(get|with|to|by|navigate|find|buy|sell|understand|manage|grow)\b/,
    "",
  );
  t = t.replace(
    /^(i|we)\s+(offer|provide|do|run|specialize in|specialise in)\s+/,
    "",
  );
  t = t.replace(/^(their|the|a|an)\s+/, "").trim();
  const clause = t.split(/[.!?\n]|,| and /)[0]?.trim();
  return clause && clause.length > 2 ? clause : doing.trim().toLowerCase();
}

function loop<T>(items: T[], count: number): T[] {
  if (items.length === 0) return items;
  const out: T[] = [];
  for (let i = 0; i < count; i++) out.push(items[i % items.length]!);
  return out;
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
