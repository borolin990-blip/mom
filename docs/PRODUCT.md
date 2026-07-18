# Luma — Product Architecture (frozen)

Luma is an **AI Marketing Manager** for Israeli mortgage advisors (real estate
professionals next). It is not a content generator and not a dashboard. It runs
a business's marketing the way a great employee would: it thinks ahead, does the
work, and asks only for approval.

> **V1 promise:** *"I make your marketing consistent, intelligent, and almost
> effortless."*
>
> If a user feels Luma has **removed the burden of marketing from their
> shoulders**, V1 has succeeded. Proving exact business outcomes (leads closed,
> meetings booked) is **out of scope for V1** — see §5 and §7.

---

## 1. Principles

1. **Workflow-first.** The product is a recurring **Weekly Cycle** with one human
   approval gate. Every screen is a *view* into that cycle; the interface serves
   the workflow, never the reverse.
2. **Proactive, not managed.** Luma initiates ("here's what I recommend this
   week"); the user mainly **approves or refines**. No blank pages.
3. **Goal-aware, honestly measured.** Work is shaped by the business's goals, but
   V1 optimizes on **signals Luma can measure truthfully** (engagement, reach,
   saves, shares, comments, publishing consistency, content quality, topic
   performance). Business-outcome attribution is a **later layer**, not a V1
   dependency.
4. **Content is a tool, not the point.** Research, ideas, posts, video scripts,
   and scheduling all exist to serve the goals.
5. **Vertical depth.** All niche logic (mortgage research sources, compliance,
   tone) lives in the Vertical module; the spine stays generic.
6. **Warm, premium identity.** Calm, elegant, quietly feminine — a personal
   assistant, not enterprise software (§11).

---

## 2. The core model: the Weekly Cycle

```
  LEARN (once, always refining)
        │
        ▼   ── every week, automatically, anchored to the business's goals ──
  RESEARCH ─► DETECT TRENDS ─► IDEATE ─► PRODUCE (posts + video scripts)
        │                                        │
        │                                        ▼
        │                                 ◇ APPROVE ◇   ← the one human gate
        │                                        │
        ▼                                        ▼
  LEARN ◄── MEASURE (content signals) ◄── PUBLISH ◄── SCHEDULE (best times)
   (re-weights next week's topics, formats, and timing)
```

`WeeklyCycle` is the central object: `weekOf`, `status`, `objectiveFocus` (which
goals this week serves), and links to its research, ideas, posts, scripts, and
close-out summary. The whole app is "show me / act on the current cycle."

**States:** `LEARNING → RESEARCHING → IDEATING → DRAFTING → REVIEW (awaiting
approval) → SCHEDULED → PUBLISHING → PUBLISHED → MEASURING → (loop)`.

---

## 3. The ten steps of a cycle

| # | Step | Auto / Approval | V1 status |
|---|------|-----------------|-----------|
| 1 | Learn business + audience | Auto (once + refine) | Have (basic) |
| 2 | Weekly market research | Auto | New (LLM + light real sources) |
| 3 | Detect trends & topics | Auto | New |
| 4 | Create post ideas (goal-tagged) | Auto | Have (generator) |
| 5 | Write complete posts | Auto | Have (generator) |
| 6 | Video scripts (Reels/TikTok) | Auto | New (LLM — easy win) |
| 7 | Present finished work for approval | **Approval** | Partial (Home) |
| 8 | Schedule best times | Auto (on approve) | Have (heuristic) |
| 9 | Publish to IG/FB/TikTok | Auto (once approved) | Interface only — **hard** (§10) |
| 10 | Learn from performance (content signals) | Auto | Model only |

---

## 4. Goals — present but light in V1

The business has a **Growth Plan**: a short, ranked set of **Goals** (e.g. more
inbound leads, re-engage past clients, generate referral conversations,
strengthen personal brand, build authority, improve engagement, more booked
meetings). Goals **shape** the cycle — Luma plans each week around the top
objective and tags each artifact with the goal it serves.

In V1, Goals influence *what Luma makes and how it talks*. They are **not** gated
on measuring business results — success is read from content signals (§5). The
`Goal`/`GrowthPlan` entities exist so the outcome layer can attach later without
a rewrite.

---

## 5. How V1 measures success (the honest signal set)

Luma optimizes and reports on signals it can observe truthfully:

- engagement, reach, saves, shares, comments
- **publishing consistency** (did we ship the plan?)
- **content quality** (proxy: engagement + how little the user edited a draft)
- **topic/format/time performance** (what resonates for this audience)

**Explicitly deferred (post-V1 "Outcome layer"):** leads, booked meetings,
reactivations, referrals, revenue — anything requiring CRM/attribution. The
model reserves an optional `Outcome` entity for this; V1 does not build or depend
on it. Rationale: business outcomes depend on many factors outside Luma's
control; V1 must deliver an amazing experience with **no CRM or attribution
system required**.

---

## 6. The customer journey (architecture serves this)

Luma is proactive at every horizon; the user mostly approves or refines.

**1. First-time onboarding — "Tell me your goals; I'll build the plan."**
A few warm questions (what she does, who she serves) + **pick growth goals**
(Luma proposes, she confirms) + learn the business/audience (optionally connect
accounts). Ends with a **Growth Plan and the first week already proposed** —
onboarding ends with work done, not an empty app.

**2. Daily experience — the morning briefing (approve/refine).**
What Luma did, what's awaiting approval, any timely opportunity, and one line of
progress. A few minutes: approve, refine, done. Never a blank page.

**3. Weekly AI cycle — the engine.**
Luma initiates: *"I analyzed your business and the market. To move your #1 goal,
here's what I recommend."* Research → trends → ideas → posts → video scripts →
**present for approval** (each tagged to its goal) → schedule → publish → close
the week with a summary.

**4. Monthly review — the relationship checkpoint.**
A calm rollup: consistency, reach and engagement trends, top topics/formats,
what Luma is changing next month, and any goal re-prioritization to confirm.
(Framed around content signals in V1; outcome reporting attaches later.)

**5. Long-term learning — the compounding moat.**
Luma's model of *this* business sharpens — best topics, formats, times, and voice
— so recommendations get better and the **trust ladder** advances (more
auto-publish, less input needed). Year-two Luma is irreplaceable because it knows
what works for her.

---

## 7. Domain model

**Reuse (have):** `Workspace → Business → BusinessKnowledge`,
`ContentAsset/GeneratedContent`, `Post`, `PostMetric` (engagement),
`SocialAccount`, the `ContentIdea` schema, the **Vertical seam**, and the
`AIProvider` / `PlatformAdapter` interfaces.

**Add (V1):**
- **`GrowthPlan` + `Goal`** — ranked objectives that shape each cycle.
- **`WeeklyCycle`** — the spine (status, `objectiveFocus`, links to its work).
- **`ResearchReport`** — weekly research: summary, `trends[]`, `topics[]`,
  sources, timestamp.
- **`VideoScript`** — hook, beats/shots, on-screen text, CTA, target length.
- **`Insight`** — a learned content-signal (e.g. "rate-drop explainers get the
  most saves") that re-weights next week.

**Reserved (post-V1, do not build yet):**
- **`Outcome`** — a measured business result (lead, meeting, reactivation),
  attributable to a cycle/post. The attach point for the future outcome layer.

---

## 8. Capability layer (services Luma runs)

- **KnowledgeService** — learn business/audience (step 1). *Have.*
- **ResearchEngine** — weekly research + trend detection (steps 2–3), per-vertical
  via the seam. *New. Must be grounded, not hallucinated (§10).*
- **IdeationService** — goal-tagged ideas from the research (step 4). *Have.*
- **ProductionService** — posts (step 5) + **video scripts** (step 6). *Extend.*
- **SchedulingEngine** — best times (step 8); becomes signal-driven. *Have.*
- **PublishingService + PlatformAdapters** — IG/FB/TikTok (step 9). *Interface only.*
- **LearningService** — content-signal learning (step 10) → `Insight`. *New.*
- **WeeklyRunner** — the orchestrator/cron that advances the cycle each week from
  the Growth Plan and invokes the services. *New — the missing "manager" spine.*

---

## 9. Automation vs approval (trust ladder)

- **Automatic:** learn, research, detect trends, ideate, draft posts + scripts,
  schedule times, publish (once approved), measure, learn.
- **Requires the user:** approving the finished week (the one gate), connecting
  accounts (one-time), and anything with specific numbers/claims (compliance, via
  the mortgage vertical).
- **Trust ladder:** safe content categories can graduate to auto-publish as trust
  is earned; input required shrinks over time.

---

## 10. Honest constraints

1. **Publishing (step 9) is the long pole.** Meta (IG/FB) needs an app + business
   verification + permission review + the user connecting a Facebook Page & IG
   Business account; TikTok needs Content Posting API approval — weeks, not days.
   **Bridge:** until approved, "publish" = scheduled + one-tap **assisted**
   publish (deep-link / copy). Isolated behind `PlatformAdapter`, so nothing else
   waits on it.
2. **Research/trends must be grounded.** An LLM inventing "trends" would destroy
   trust. Start narrow and truthful per vertical (mortgage: rates, economic
   calendar, housing news) + LLM synthesis over real signals.
3. **Learning needs data.** Content-signal learning is meaningful once posts are
   published and measured; heuristic until then.
4. **Video scripts are the easy win** — pure LLM, no integration.

---

## 11. Visual identity (built when screens resume)

Away from enterprise SaaS entirely — **warm, elegant, quietly feminine, premium
personal-assistant**:
- **Palette:** soft blush, warm sand/greige neutrals, a restrained **burgundy /
  wine** accent, warm ink (brown-black) — no cold pixels.
- **Type:** an editorial **serif** for headings + a clean humanist sans for text.
- **Layout:** generous whitespace, soft rounded forms, gentle shadows, unhurried
  pacing.
- **Feel:** calm confidence, premium lifestyle, a trusted personal assistant.

The dark-navy concept is retired. When screens resume, the warm design system is
built first, then Home is re-skinned under it.

---

## 12. Build sequencing (value-first)

- **Slice A — make the weekly cycle real end-to-end, no external APIs.**
  `WeeklyCycle` + `WeeklyRunner`, Growth Plan/Goals (light), `ResearchEngine`
  (grounded), goal-tagged ideas → posts → **video scripts** → **Approvals** →
  schedule. Publishing is assisted (copy/deep-link). Delivers ~80% of the felt
  magic — *"Luma did a full week of marketing; approve it"* — with none of the
  integration wait.
- **Slice B — real auto-publish.** Meta + TikTok adapters + OAuth.
- **Slice C — the learning loop.** Content signals → `Insight` → better next week.
- **Later — the Outcome layer.** Lead/meeting capture + attribution, when there's
  a reliable, low-friction way to observe them.

---

## 13. V1 non-goals (explicitly deferred)

- Business-outcome attribution (leads/meetings/deals) and any CRM integration.
- Real-time auto-publishing before platform approvals (assisted publish bridges).
- Platforms beyond Instagram / Facebook / TikTok.
- Multi-user / roles / billing beyond the existing scaffolding.
