import { prisma, type Business } from "@mom/db";
import type { Env } from "@mom/config";
import { getAIProvider } from "../ai";
import { getKnowledge } from "../services/knowledge.service";
import { toBusinessContext } from "../services/business.service";
import { recommendPostTime } from "../scheduling/best-time";
import { resolveVerticalForBusiness } from "../verticals/registry";
import type { Suggestion } from "./suggestion.types";

export * from "./suggestion.types";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Produce the marketing manager's suggestions for a business. Combines real
 * signals from the account (posting cadence, content mix, last format) with
 * fresh AI-generated ideas, then orders them so the most useful nudge is first.
 */
export async function getSuggestions(
  env: Env,
  business: Business,
): Promise<Suggestion[]> {
  const [lastAsset, assetCount, categories] = await Promise.all([
    prisma.contentAsset.findFirst({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contentAsset.count({ where: { businessId: business.id } }),
    prisma.generatedContent.groupBy({
      by: ["category"],
      where: { isPrimary: true, asset: { businessId: business.id } },
      _count: { category: true },
    }),
  ]);

  const suggestions: Suggestion[] = [];

  // 0. Vertical-specific proactive suggestions (e.g. rate-drop → refi post).
  //    These lead the feed because they're the most timely/valuable. Built out
  //    inside the vertical module as its data sources come online.
  const vertical = resolveVerticalForBusiness(business);
  if (vertical.contributeSuggestions) {
    try {
      suggestions.push(...(await vertical.contributeSuggestions({ env, business })));
    } catch {
      // A vertical hiccup must never break the core feed.
    }
  }

  // 1. Cadence / welcome — grounded in real activity.
  if (assetCount === 0) {
    suggestions.push({
      id: "welcome",
      kind: "welcome",
      icon: "👋",
      title: "Let's create your first post",
      body: "Upload a video or photo and I'll write everything for you — caption, hook, and hashtags.",
      cta: "Create a post",
      action: { type: "open-create" },
    });
  } else {
    const days = Math.floor(
      (Date.now() - lastAsset!.createdAt.getTime()) / DAY_MS,
    );
    if (days >= 3) {
      suggestions.push({
        id: "cadence",
        kind: "cadence",
        icon: "⏰",
        title: `You haven't posted in ${days} days`,
        body: "Consistency keeps you top of mind with your audience. Let's get something out today.",
        cta: "Create a post",
        action: { type: "open-create" },
      });
    }
  }

  // 2. Fresh AI ideas — the proactive core.
  try {
    const knowledge = getKnowledge(business);
    const ideas = await getAIProvider(env).generateContentIdeas({
      business: toBusinessContext(business),
      knowledge,
      count: 3,
    });
    ideas.forEach((idea, i) => {
      suggestions.push({
        id: `idea-${i}`,
        kind: "idea",
        icon: "✨",
        title: idea.title,
        body: `${idea.angle} ${idea.why}`,
        cta: "Create this",
        action: {
          type: "create-idea",
          idea: `${idea.title} — ${idea.angle}`,
        },
      });
    });
  } catch {
    // Ideas are a bonus; never let a provider hiccup break the whole feed.
  }

  // 3. Content mix — encourage variety when the account skews one way.
  const hasStory = categories.some((c) =>
    (c.category ?? "").toLowerCase().includes("story"),
  );
  if (assetCount >= 2 && !hasStory) {
    suggestions.push({
      id: "mix",
      kind: "mix",
      icon: "🎭",
      title: "Share a personal story this week",
      body: "Your recent posts are mostly informational. A human story builds trust and connection.",
      cta: "Create this",
      action: {
        type: "create-idea",
        idea: "A short, personal story about why I do this work and who I love helping",
      },
    });
  }

  // 4. Format tip — nudge better use of an existing asset.
  if (lastAsset?.type === "VIDEO") {
    suggestions.push({
      id: "format",
      kind: "format",
      icon: "🖼️",
      title: "Turn your latest video into a carousel",
      body: "Breaking a video into a few key points as a carousel often gets more saves and shares.",
      action: { type: "none" },
    });
  }

  // 5. Timing — always-useful managerial nudge.
  const slot = recommendPostTime();
  suggestions.push({
    id: "timing",
    kind: "timing",
    icon: "📅",
    title: `Best time to post: ${slot.label}`,
    body: slot.reason,
    action: { type: "none" },
  });

  return suggestions;
}
