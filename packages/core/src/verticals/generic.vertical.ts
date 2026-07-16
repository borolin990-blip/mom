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
};
