# Roadmap

## Phase 0 — Foundation ✅ (this milestone)

- [x] Monorepo scaffold (npm workspaces: `apps/*`, `packages/*`)
- [x] TypeScript configuration (`@mom/config` base tsconfig)
- [x] Environment validation (zod-validated `@mom/config` env)
- [x] Prisma setup (`@mom/db` client singleton + scripts)
- [x] Initial multi-tenant database schema
- [x] Project documentation (README, ARCHITECTURE, ROADMAP)

## Phase 1 — Core AI Content Engine

The heart of the product: **upload once → get a complete AI content plan.**
Prioritized to prove core product value before auth (owner's decision).

Built in this milestone:

- [x] Design-system UI primitives + application shell (sidebar/topbar)
- [x] Storage abstraction (`local` working, `r2` prepared) + upload experience
- [x] AI engine: `AIProvider` interface, `mock` + `openai` providers, versioned
  prompt registry, Zod-validated output schemas
- [x] AI generation workflow: analysis + hook / caption / description / CTA /
  hashtags / category / suggested platform + alternative variations
- [x] Simple "active business" auth placeholder (single seam for real auth)

### Phase 1 UX redesign + AI Marketing Manager

The product was reshaped from a tool into a proactive assistant:

- [x] **Create-first** app structure: **Create · Posts · Business** (the
  vanity dashboard was removed; the app opens on "what would you like to
  create today?")
- [x] **Invisible onboarding** → **Business Knowledge Profile**: three questions
  + optional website/social links, from which the AI derives services,
  audience, tone, pain points, writing style, CTA style, and topics
- [x] **AI Suggestions** (the Marketing Manager): proactive recommendations from
  real signals (posting cadence, content mix, format, best time) plus fresh
  AI-generated content ideas — "here's what I think you should create today"
- [x] **Multi-modal Create**: upload media **or** write an idea (idea-only posts)
- [x] **Redesigned result screen**: per-platform previews, per-field + full-post
  copy, AI-recommended schedule + Add to calendar, "Ready to post" status, and
  Publish/Connect controls shown as *Coming soon*
- [x] **Posts**: list + month calendar of ready/scheduled content
- [x] **Business**: Knowledge Profile, connected-account placeholders, branding
  and billing (Coming soon)

Deferred within Phase 1 (next up):

- [ ] Real auth (email/password + OAuth) → replaces the active-business seam
- [ ] Live website/social scraping to enrich the Knowledge Profile (currently
  inferred from the onboarding answers)

**No social API publishing in Phase 1** — the UI is designed as if it's one tap
away, but the integrations land in Phase 2.

## Phase 2 — Distribution & Learning

- Social integrations: Facebook, Instagram, TikTok, LinkedIn adapters
- OAuth account connection + automatic publishing
- Real analytics ingestion
- AI learning loop (performance data improves future generations)

## Phase 3 — Advanced AI Studio

- Video editing
- Automatic reels creation
- Advanced AI marketing assistant

---

## Phase 0 — decisions & assumptions

**Decisions**
- **npm workspaces** (not pnpm/turbo) for the monorepo — zero extra tooling to
  install, simplest path to a runnable foundation. A task runner can be added
  later without restructuring.
- **Lazy env validation** (`getEnv()`), so tooling that doesn't need env (e.g.
  `prisma generate`) never trips the checks; the app validates on first use.
- **Provider credentials enforced only when selected** — `mock` AI + `local`
  storage require no secrets, keeping the MVP runnable out of the box.
- **`@mom/core` shipped as a placeholder** so the module boundary exists now and
  other packages can depend on it before the engine is written.
- **Publishing/performance tables modeled in Phase 0** even though unused until
  Phase 2, to avoid a disruptive migration later.

**Assumptions**
- A **Workspace** is the tenant + billing boundary; a workspace may own multiple
  **Businesses** (supports agencies from the start).
- The **first user** (a mortgage consultant) is represented by a seeded demo
  business; real onboarding replaces the seed in Phase 1.4.
- **PostgreSQL** is the target DB in every environment (dev included) — no
  SQLite fallback, to keep dev/prod parity.
- Packages are consumed directly as **TypeScript source** in-repo (via
  workspace symlinks); no separate build step is needed until an external
  consumer requires compiled output.
