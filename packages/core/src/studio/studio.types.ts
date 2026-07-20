/**
 * The Content Studio decision record — a transparent window into Luma's
 * thinking for a single plan item. Consistent with LUMA_PROMPTING_SYSTEM
 * (diverge → critique → select → score → verify). Stored on PlanItem.decision.
 */

export interface RejectedAlternative {
  idea: string;
  reason: string;
}

export interface QualityDimension {
  name: string;
  score: number; // 0–5
}

export interface QualityScore {
  dimensions: QualityDimension[];
  overall: number; // 0–5
  confidence: number; // 0–1
}

export interface ComplianceCheck {
  passed: boolean;
  notes: string[];
}

export interface ItemDecision {
  /** The market/business signal that triggered this item. */
  signal: string;
  /** Candidates Luma considered and rejected, with reasons. */
  alternatives: RejectedAlternative[];
  /** Why this idea won. */
  whyWon: string;
  quality: QualityScore;
  compliance: ComplianceCheck;
  /** Recommended visual/creative direction. */
  visualDirection: string;
}
