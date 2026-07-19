import type { Vertical } from "./vertical.interface";

/**
 * The generic fallback vertical. Preserves today's behavior for any business
 * not bound to a specialized vertical. Kept intentionally plain — the product's
 * focus and depth live in the mortgage vertical.
 */
export const genericVertical: Vertical = {
  key: "generic",
  label: "Business",
  primaryGoalLabel: "More customers",

  contentPersona:
    "an expert social media marketer helping a small business win more customers",
  contentGuidance:
    "Write specific, credible, human copy tailored to the business's audience. Avoid generic filler and spammy phrasing.",

  onboardingQuestions: [
    {
      key: "whatWeDo",
      label: "What does your business do?",
      placeholder: "e.g. I help first-time buyers get a mortgage",
      required: true,
      type: "textarea",
    },
    {
      key: "idealCustomer",
      label: "Who is your ideal customer?",
      placeholder: "e.g. Young families buying their first home",
      type: "text",
    },
    {
      key: "goal",
      label: "What's your main goal?",
      type: "choice",
      choices: [
        { value: "leads", label: "More leads" },
        { value: "sales", label: "More sales" },
        { value: "awareness", label: "Brand awareness" },
      ],
    },
  ],

  content: {
    locale: "en",
    goals: [
      { key: "leads", label: "More leads" },
      { key: "awareness", label: "Brand awareness" },
      { key: "authority", label: "Build authority" },
      { key: "engagement", label: "More engagement" },
    ],
    pillars: [
      { key: "education", label: "Education" },
      { key: "story", label: "Story" },
      { key: "tips", label: "Tips" },
    ],
    research: {
      summary:
        "Steady interest in your niche this week. Educational content and a human story tend to perform best.",
      trends: ["How-to content", "Behind-the-scenes"],
      topics: ["A common question", "A quick tip"],
      recommendation:
        "Lead with education and one personal story; add a single soft call to action.",
    },
    seeds: [
      {
        topic: "A helpful how-to",
        pillar: "education",
        role: "EDUCATIONAL",
        format: "CAROUSEL",
        platform: "INSTAGRAM",
        goalKey: "authority",
        hook: "The one thing most people get wrong about this.",
        caption:
          "A clear, no-jargon breakdown so you can make a confident decision.",
        cta: "Want help? Send me a message.",
        hashtags: ["smallBusiness", "tips"],
        rationale: "Educational value builds trust.",
      },
      {
        topic: "A personal story",
        pillar: "story",
        role: "TRUST",
        format: "STATIC",
        platform: "INSTAGRAM",
        goalKey: "awareness",
        hook: "Here's why I do what I do.",
        caption: "A short, human story that builds connection.",
        cta: "Reach out anytime — I'm here to help.",
        hashtags: ["smallBusiness", "story"],
        rationale: "A human story balances the mix.",
      },
      {
        topic: "A soft invitation",
        pillar: "tips",
        role: "CONVERSION",
        format: "STATIC",
        platform: "INSTAGRAM",
        goalKey: "leads",
        hook: "Not sure where to start? Let's talk.",
        caption: "A quick, no-pressure chat to see what fits you.",
        cta: "Send me a message to set up a quick call.",
        hashtags: ["smallBusiness"],
        rationale: "The weekly ask, after value is given.",
      },
    ],
  },
};
