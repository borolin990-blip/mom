import type { Vertical } from "./vertical.interface";

/**
 * Mortgage Advisor — the primary vertical. This module is where the product's
 * depth lives: the lead-focused persona, compliance guardrails, and (as we
 * build them next) the rate engine, refi/reactivation signals, and lead
 * magnets. Nothing mortgage-specific belongs in the generic services — it lives
 * here.
 */
export const mortgageVertical: Vertical = {
  key: "mortgage",
  label: "Mortgage Advisor",
  primaryGoalLabel: "Qualified leads",

  contentPersona:
    "an expert marketing manager for a licensed mortgage advisor, whose sole job is to generate qualified leads (pre-approvals, refinance inquiries, and first-time-buyer conversations)",

  // Compliance-aware guardrails. These reduce risk; they do not replace the
  // advisor's own compliance obligations, and anything with specific numbers
  // stays human-approved.
  contentGuidance: [
    "Focus every post on helping a potential borrower take the next step (get pre-approved, ask about refinancing, learn if they're ready to buy).",
    "Be compliance-aware: never guarantee a rate, approval, or savings; avoid specific rate/APR numbers unless the advisor explicitly provides them; don't make misleading claims.",
    "Prefer education and reassurance (first-time buyer basics, loan programs like FHA/VA/conventional, the pre-approval process, refinance timing).",
    "Keep Fair Housing in mind: never use language that could steer or exclude based on a protected class.",
    "Sound like a trusted local expert, not a salesperson.",
  ].join(" "),

  onboardingQuestions: [
    {
      key: "whatWeDo",
      label: "Tell me about your mortgage practice",
      placeholder: "e.g. I help first-time buyers and refinancers in Austin, TX",
      required: true,
      type: "textarea",
    },
    {
      key: "idealCustomer",
      label: "Who do you most want to reach?",
      placeholder: "e.g. First-time buyers and past clients who could refinance",
      type: "text",
    },
    {
      key: "loanPrograms",
      label: "Which loan programs do you focus on?",
      placeholder: "e.g. Conventional, FHA, VA, jumbo, down-payment assistance",
      type: "text",
      hint: "Helps me write accurate, relevant content.",
    },
    {
      key: "marketArea",
      label: "What market do you serve?",
      placeholder: "e.g. Greater Austin metro",
      type: "text",
    },
    {
      key: "nmlsId",
      label: "Your NMLS ID",
      placeholder: "e.g. 1234567",
      type: "text",
      hint: "I'll include it where required so your posts stay compliant.",
    },
  ],

  // contributeSuggestions is intentionally omitted for now: real rate/market
  // signals (the Morning Brief) are built next, inside this module.
};
