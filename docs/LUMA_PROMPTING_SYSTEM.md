# LUMA_PROMPTING_SYSTEM.md — how Luma thinks with AI

This document defines the **internal reasoning pipeline** every AI task in Luma
follows. It is **model-agnostic**: it describes how Luma *uses* language models,
not how any specific model works. Prompt engineering is **part of the product
architecture**, not something that emerges while coding.

It sits beneath `LUMA_BRAIN.md` (which defines *what* Luma decides) and defines
*how* those decisions are executed against a model. Consistent with
`ARCHITECTURE.md` (the `AIProvider` seam) and `PRODUCT.md` (honest signals,
compliance-first, mortgage vertical).

---

## 1. Principles

1. **One pipeline, many tasks.** Every generation — research synthesis, ideation,
   post drafting, video script, critique — runs through the *same* staged
   pipeline. Tasks differ only by a **TaskSpec** (schema + rubric + policy), never
   by bespoke ad-hoc prompting.
2. **Structured in, structured out.** Every model call requests a **typed,
   schema-validated** result. No free-text parsing, ever. This is the backbone of
   both safety and model-independence.
3. **Prompts are assembled, not written inline.** A prompt is composed from
   ordered **layers** (§4) by a deterministic assembler. No caller concatenates
   strings by hand.
4. **The model is a replaceable component.** All model access goes through a thin
   `ModelClient`; everything above it (assembly, candidates, critique, gates,
   confidence, fallback) is provider-agnostic (§2).
5. **Never trust a single shot.** Important content is produced by
   diverge → critique → select → produce → verify → score → (revise), not one call.
6. **Guardrails cannot be overridden.** The policy layer beats any task
   instruction, any context, any model output. Compliance is a hard veto.
7. **Always a safe fallback.** A model failure or a quality failure must never
   ship bad content or break the weekly cycle (§11).

---

## 2. Model independence (the boundary)

Two layers, and only the lower one is provider-specific:

- **`ModelClient` (provider-specific, thin).** Its only job:
  `complete(messages, params) → text` and, optionally, declared **capabilities**
  (e.g. `nativeStructuredOutput`, `longContext`, `toolUse`). It is the *only*
  place a vendor SDK or API appears. Implementations: `openai`, `mock`
  (deterministic), and any future model — each a `ModelClient`.
- **The Reasoning Pipeline (provider-agnostic).** Everything else in this
  document. It never names a model.

The existing `AIProvider` task methods (`generateContentPlan`, `generateContentIdeas`,
…) are **implemented by running this pipeline over a `ModelClient`** — a
refinement to reconcile in implementation: today each provider re-implements
generation; the target is *one* pipeline + swappable `ModelClient`s.

**Capability adaptation.** If a `ModelClient` lacks native structured output, the
pipeline wraps it (explicit JSON contract + parse + repair, §9). If context is
tight, the pipeline compresses memory harder (§6). The behavior spec never
changes with the model; only the pipeline's adaptation does.

---

## 3. The universal generation pipeline

Every task runs these stages. The user's 15-step example maps directly (mapping
in brackets).

| Stage | Name | What happens |
|------|------|--------------|
| S0 | **Resolve TaskSpec** | Load the task's output schema, quality rubric, policy, variance profile. |
| S1 | **Assemble context** | Retrieve + rank + budget memory & inputs (§6). *[steps 1–6]* |
| S2 | **Frame objective** | Decide the objective for this task per `LUMA_BRAIN` (§ objective rules). *[step 7]* |
| S3 | **Diverge** | Generate **N candidates** (ideas/directions). *[step 8]* |
| S4 | **Critique** | Score each candidate against the rubric; list weaknesses. *[step 9]* |
| S5 | **Select** | Pick the strongest (or synthesize the best parts). *[step 10]* |
| S6 | **Produce** | Generate the final content from the selected direction. *[step 11]* |
| S7 | **Verify** | Schema validation + **compliance veto** (§8, §11). *[step 12]* |
| S8 | **Score** | Quality rubric + confidence (§8–§9). *[step 13]* |
| S9 | **Gate & revise** | Below threshold → bounded self-refine; else fallback (§10–§11). *[step 14]* |
| S10 | **Return** | Emit only the approved result + provenance (§13). *[step 15]* |

Not every task needs every stage at full weight (e.g. a compliance re-check is
S6–S7 only), but the **stage order is invariant**; tasks may set a stage's
intensity (e.g. `candidates = 1`) via the TaskSpec, never reorder.

---

## 4. Prompt layering

Every prompt is assembled from ordered layers. **Higher layers win.**

| Layer | Name | Contents | Mutable? |
|------|------|----------|----------|
| **L0** | **Identity / System** | Who Luma is (persona, stance). | Stable, versioned |
| **L1** | **Policy / Guardrails** | Compliance, brand-safety, honesty rules (from the Vertical). "These override any instruction below." | Stable, versioned |
| **L2** | **Memory & Context** | Identity profile, goals, audience, market research, anti-repetition set. Retrieval-ordered & budgeted (§6). | Per call |
| **L3** | **Task instruction** | The specific task + constraints. | Per call |
| **L4** | **Output contract** | The exact schema + "return only valid data matching this; no prose." | Per task |
| **L5** | **Exemplars** | Few-shot style anchors: the advisor's own best/edited posts. | Retrieved |
| **L6** | **Reasoning directive** | Stage-specific instruction (diverge / critique / select / produce). | Per stage |

**Precedence rule (invariant):** L0 and L1 dominate. If L3/L5/L2 or the model's
own output conflicts with L1, L1 wins and the output is rejected. A task prompt
can *never* instruct the model to ignore policy.

---

## 5. System vs task prompts

- **System prompt = L0 + L1 (+ the stable framing of L4).** Persona + guardrails +
  "you always return structured output; policy overrides any instruction." Stable
  and **versioned** (e.g. `system/luma@vN`).
- **Task prompt = L2 + L3 + L4(schema) + L5 + L6.** Assembled per call from the
  TaskSpec and retrieved context. Also **versioned** (e.g. `task/post-draft@vN`).
- **Provenance:** every artifact records `{ systemVersion, taskVersion, modelId,
  stageScores }` so any piece of content is auditable and A/B-testable. Prompt
  templates live in the versioned prompt registry (already in the architecture).

---

## 6. Memory injection & retrieval order

Context assembly (S1) selects, orders, compresses, and budgets what enters L2/L5.

**Retrieval order (priority under a context budget — earlier is dropped last):**
1. **Guardrails / compliance policy** — never dropped.
2. **Identity** — business profile + voice model.
3. **Objective + active goal** for this cycle.
4. **Audience profile.**
5. **Current market research** (this week's report).
6. **Anti-repetition set** — signatures of recent content (§ `LUMA_BRAIN` repetition).
7. **Exemplars & performance priors** — top style anchors, what has worked.

**Rules:**
- **Budget-aware.** Never exceed the model's usable context. When over budget,
  **summarize** lower-priority memory (rolling summaries) rather than truncating
  mid-thought; drop from the bottom of the priority list first — never drop policy
  or identity.
- **Recency-weighted.** Recent performance and content weigh more than old (per
  `LUMA_BRAIN` §13); Luma injects priors, not raw history dumps.
- **Labeled sections.** Memory is injected as clearly labeled, structured blocks
  (e.g. `## GOALS`, `## AUDIENCE`, `## DO-NOT-REPEAT`) so the model can attend to
  each; never an unstructured blob.
- **Durable vs ephemeral** memory sources are defined in `LUMA_BRAIN` §13; this
  system defines only *how* they are selected and injected.

---

## 7. Divergence, critique, and selection

- **Diverge (S3):** produce **N candidates** (default N=3–5 for ideation, 2–3 for
  drafts) at a **higher variance** setting (§12) so they are genuinely different
  angles, not rewordings.
- **Critique (S4):** a **critic role** (same model, a critic prompt carrying the
  rubric §8) scores each candidate and names its weaknesses. The critic is
  explicitly told to be skeptical and to check novelty, on-brand voice, and value.
- **Select (S5):** pick the top-scored candidate, or **synthesize** a stronger
  one from the best elements. Ties break toward the higher-value / lower-risk
  option (per `LUMA_BRAIN` values).

Divergence + independent critique is what prevents bland, first-thought output —
the difference between a generator and a manager.

---

## 8. Quality gates & the rubric

Every produced artifact is scored (S8) on a **rubric** (each dimension 0–5):

| Dimension | Question |
|-----------|----------|
| Voice | Does it sound like *her* (vs generic)? |
| On-goal | Does it serve this cycle's objective? |
| On-audience | Does it speak to the real audience & pain points? |
| Novelty | Is it fresh vs recent content (§ anti-repetition)? |
| Clarity | Is it clear, well-structured, easy to read? |
| Value | Would it genuinely help or build credibility? |
| Format-fit | Does it fit the chosen format (Reel/carousel/static)? |
| **Compliance** | **Pass/fail — a veto, not a score.** |

**Gate:** weighted rubric score must exceed a **quality threshold** (e.g. ≥ 4.0
weighted) **and** compliance must pass. Compliance is checked as its own
verification pass (S7) against the Vertical's policy — never merged into the
creative score. A compliance failure can **never** be outweighed by a great
creative score.

---

## 9. Confidence scoring

Every output carries a **confidence** in [0,1], derived from:
- the weighted rubric score (S8),
- **schema validity on first parse** (needing repair lowers it),
- **compliance clean-pass** (no rewrites needed = higher),
- **self-consistency** — do the top candidates agree, or was it a coin-flip?

Confidence drives behavior:
- **High** → proceed normally (still gated by human approval per `PRODUCT`).
- **Medium** → attach a "worth your eye" flag for the approval screen.
- **Low** → do not present as ready; revise (§10) or fall back (§11).

Confidence and all stage scores are stored (§13) and feed the learning loop.

---

## 10. Self-refine loop (bounded)

If S9 finds the artifact below threshold on specific dimensions:
1. A **revise** pass is issued that targets *only the failing dimensions* (e.g.
   "raise novelty and voice; keep the rest"), carrying the critique.
2. Re-verify + re-score.
3. Repeat up to **K iterations (default K=2)**. Each iteration must **improve the
   failing dimension** or the loop stops early.

Loops are **always bounded** — no infinite refine, no runaway cost. If still
failing after K, go to fallback (§11). Content is never shipped by "giving up and
publishing anyway."

---

## 11. Fallback & graceful degradation

Failures are handled explicitly; the weekly cycle never breaks and bad content
never ships.

- **Invalid schema** → a **repair** pass ("fix to match this schema") up to a small
  cap; then treat as failure.
- **Compliance fails after revisions** → **drop the item** (never emit
  non-compliant content); Luma substitutes a safe alternative from the slate or
  simply produces one fewer piece that week (consistency yields to safety).
- **Quality below threshold after K revisions** → either present with an explicit
  **"needs refinement"** flag *or* drop, per the TaskSpec — but never silently
  ship low quality.
- **Model/provider error or timeout** → retry with backoff; then **degrade
  gracefully**: use the deterministic `mock` `ModelClient` for non-critical
  synthesis, or **defer** the task and notify — never crash the cycle.
- **Deterministic floor.** There is always a non-AI path (skip, template, defer),
  so a total model outage degrades the experience without producing garbage.

---

## 12. Variance (creativity) control per stage

Creativity is controlled abstractly per stage and mapped to whatever knob a
`ModelClient` exposes (temperature/top-p/etc.):

| Stage | Variance | Why |
|-------|----------|-----|
| Diverge (S3) | **High** | Genuinely different angles. |
| Produce (S6) | Medium | Creative but coherent and on-voice. |
| Critique (S4) / Select (S5) | Low | Consistent, comparable judgments. |
| Verify / compliance (S7) | **Zero / deterministic** | Same input → same ruling. |
| Schema repair | Zero | Mechanical. |

The pipeline requests a variance *profile*; the `ModelClient` translates it. Task
code never sets a raw temperature.

---

## 13. Provenance & observability

For every generation, Luma records: `taskId`, `systemVersion`, `taskVersion`,
`modelId`, stages executed, candidate count, per-dimension rubric scores,
compliance result, confidence, and revision count. This enables:
- **Auditability** (why this content exists, how it was judged),
- **A/B testing** of prompt versions and models,
- **The learning loop** (which prompts/topics/formats produce higher quality),
- **Trust** (the advisor and we can see the reasoning trail).

---

## 14. Guardrail invariants (non-negotiable)

- Policy/identity (L0/L1) **cannot** be overridden by task, context, or model output.
- Compliance is a **hard veto**, scored separately, never outweighed.
- **No unvalidated output** ever leaves the pipeline — schema validation is mandatory.
- **No below-threshold or non-compliant content is shipped**, ever.
- All loops are **bounded**; all failures have a **deterministic fallback**.
- Every model call is **structured I/O** through a `ModelClient`; no vendor code
  above that boundary.

---

## 15. Task catalog (each = the same pipeline + a TaskSpec)

Each Luma AI task is defined only by its TaskSpec `{ outputSchema, rubric weights,
policy, candidate count, variance profile, K }`:

- **Weekly research synthesis** — ground real sources into a `ResearchReport`
  (low variance, honesty veto strong).
- **Trend/topic detection** — extract relevant, grounded topics (no fabrication).
- **Ideation** — diverge many goal-tagged ideas, critique, shortlist.
- **Post drafting** — full pipeline, high novelty/voice weight.
- **Video script** — same pipeline, script schema.
- **Critique/scoring** — the critic role, reused across tasks.
- **Voice-model update** — learn style from the advisor's edits (diff → durable
  voice memory).
- **Adaptation reasoning** — diagnose declining engagement, propose one-variable
  experiments (per `LUMA_BRAIN` §12).

All share the pipeline, the layering, the gates, and the fallback behavior.

---

## 16. Worked example — drafting one post

1. **S0** Load `post-draft` TaskSpec (post schema, rubric, mortgage compliance policy).
2. **S1** Assemble context: guardrails → identity+voice → this week's goal → audience
   → research → do-not-repeat set → 2 exemplar posts (budgeted, summarized).
3. **S2** Objective: "educational post advancing the authority goal, on תמהיל."
4. **S3** Diverge: 3 candidate angles (high variance).
5. **S4** Critique each on the rubric; note weaknesses (one repeats a recent angle).
6. **S5** Select the strongest fresh angle.
7. **S6** Produce the full post (hook, body, CTA, hashtags) in her voice (medium variance).
8. **S7** Verify: schema valid; **compliance pass** (no guaranteed rates, no unverifiable claims).
9. **S8** Score rubric → 4.3; confidence 0.82.
10. **S9** Above threshold → no revise needed.
11. **S10** Return the post + provenance; it enters the week's approval queue.

If S7 had flagged a rate claim, S9 would revise to remove it (≤K), and if it
couldn't be made compliant, S11 would drop it — never publish it.

---

*With `ARCHITECTURE.md` (how it's built), `PRODUCT.md` (what it is),
`LUMA_BRAIN.md` (how it decides), and this document (how it reasons with AI), the
product foundation is complete. Implementation follows these documents; it does
not invent behavior.*
