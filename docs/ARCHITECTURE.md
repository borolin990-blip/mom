# Architecture

mom is an **AI Content Operating System**, not a scheduler. The architecture is
organized so the AI content engine — the actual product value — is a
first-class, provider-abstracted, framework-independent layer, and so the
product can grow into a multi-tenant SaaS without a rewrite.

## Guiding principles

1. **Strict layer separation.** The UI never imports the AI engine or the ORM.
   Layers communicate through typed interfaces and `@mom/core` services.
2. **Multi-tenant from row one.** `Workspace` is the tenant/billing boundary;
   every content row is reachable from a `Business` inside a workspace.
3. **Provider abstraction.** AI and storage sit behind interfaces so models,
   vendors, and backends can change without touching application code.
4. **Modular integrations.** Each social platform is a self-contained adapter,
   added without changing anything else.
5. **Simplicity for non-technical users.** The eventual UX must feel effortless.
   Complexity lives in the engine, never in the user's face.

## Layers

```
┌─────────────────────────────────────────────────────────────┐
│  UI LAYER            apps/web  (Next.js, React)              │  no OpenAI / no Prisma
├─────────────────────────────────────────────────────────────┤
│  API LAYER           apps/web/src/app/api  (thin)           │  auth + validation, delegates
├─────────────────────────────────────────────────────────────┤
│  BUSINESS LOGIC      packages/core/services                 │  use-case orchestration
├──────────────┬──────────────┬──────────────┬────────────────┤
│  AI ENGINE   │  PUBLISHING  │  SCHEDULING  │  STORAGE        │  swappable providers
├──────────────┴──────────────┴──────────────┴────────────────┤
│  DATA LAYER          packages/db  (Prisma + Postgres)       │  only place the ORM lives
└─────────────────────────────────────────────────────────────┘
```

## Packages

| Package | Responsibility | Depends on |
| --- | --- | --- |
| `@mom/config` | Shared TS base config; single validated source of `env`. | — |
| `@mom/db` | Prisma schema, migrations, seed, client singleton. | `@mom/config` |
| `@mom/core` | Business logic, AI engine, storage/publishing/scheduling abstractions, shared types. | `@mom/config`, `@mom/db` |
| `apps/web` | Next.js UI + thin API controllers. | `@mom/core`, `@mom/db` |

`@mom/core` never imports React or Next.js. This is what lets us later extract a
standalone API/worker service that reuses the exact same engine.

## Data model (multi-tenancy)

```
Workspace (tenant, billing)
 ├── Membership → User        (roles: OWNER / ADMIN / EDITOR / VIEWER)
 ├── Subscription             (plan: FREE / STARTER / PRO / AGENCY)
 └── Business (one or many — supports agencies)
      ├── ContentAsset        (uploaded video/image + AI analysis)
      │    └── GeneratedContent   (versioned; primary + alternatives)
      ├── SocialAccount       (connected platform — Phase 2)
      └── Post                (scheduled/published unit, per platform)
           └── PostMetric     (performance — Phase 2 learning loop)
```

Tenant isolation: every content-bearing row carries `businessId`, and each
`Business` carries `workspaceId`, so queries can be scoped to a tenant.

## Provider abstractions (defined in Phase 1)

- **AIProvider** — `mock` (deterministic, no key) and `openai` implementations
  behind one interface. Prompts live in a versioned registry; outputs are
  validated with Zod schemas so the rest of the app receives typed results.
- **StorageProvider** — `local` (disk) and `r2` (S3-compatible) behind one
  interface. Assets are referenced by opaque `storageKey`, never a hardcoded URL.
- **PlatformAdapter** — one module per social platform (Facebook, Instagram,
  TikTok, LinkedIn, YouTube), registered in a registry. Modeled in Phase 0,
  implemented in Phase 2.

## Environment & secrets

`@mom/config` is the only place `process.env` is read. It validates all
variables with zod and fails fast with a readable error. Provider credentials
are required only when that provider is selected, so the app runs end-to-end
with `AI_PROVIDER=mock` + `STORAGE_PROVIDER=local` and zero secrets. All secrets
are server-side only.

## Decisions & assumptions (Phase 0)

See [`ROADMAP.md`](ROADMAP.md) for phase scope. Key Phase 0 decisions and
assumptions are recorded at the bottom of that file.
