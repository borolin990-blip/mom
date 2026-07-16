/**
 * A proactive recommendation from the AI marketing manager. Suggestions are
 * what make the product feel like an assistant that's "always thinking" — the
 * answer to "here's what I think you should create today."
 */
export type SuggestionKind =
  | "welcome"
  | "cadence"
  | "idea"
  | "mix"
  | "timing"
  | "format";

export interface SuggestionAction {
  /**
   * - "create-idea": start a new idea-based post prefilled with `idea`.
   * - "open-create": take the user to the Create screen.
   * - "none": informational only.
   */
  type: "create-idea" | "open-create" | "none";
  idea?: string;
}

export interface Suggestion {
  id: string;
  kind: SuggestionKind;
  icon: string;
  title: string;
  body: string;
  /** Button label, when there's an action. */
  cta?: string;
  action: SuggestionAction;
}
