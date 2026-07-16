# mom — AI Content Operating System

An AI-powered social media manager for small business owners. Upload content
once; the AI analyzes it, understands the business, and produces a complete,
ready-to-publish content plan — captions, hooks, hashtags, CTAs, and a
schedule. Built to grow into a multi-tenant SaaS for mortgage advisors, real
estate agents, lawyers, doctors, coaches, and other small businesses.

> **This is not a scheduler.** The AI content engine is the product. Every
> feature answers one question: _does this help a business owner get more
> leads with less effort?_

## Status

**Phase 0 — foundation.** Monorepo, TypeScript config, environment validation,
Prisma setup, and the initial multi-tenant database schema. The AI engine, web
app, auth, and integrations are built in later phases (see
[`docs/ROADMAP.md`](docs/ROADMAP.md)).

## Architecture at a glance

Strict layer separation — the UI never imports the AI engine or the ORM.

```
apps/web            UI + thin API (Next.js)          — built in Phase 1.2+
packages/core       business logic, AI engine,       — built from Phase 1.6
                    storage/publishing abstractions
packages/db         Prisma schema + client (the      — Phase 0 ✅
                    only place the ORM lives)
packages/config     shared tsconfig + validated env  — Phase 0 ✅
```

Full detail: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Monorepo layout

| Package | Purpose |
| --- | --- |
| `@mom/config` | Shared TypeScript base config + zod-validated environment. |
| `@mom/db` | Prisma schema, migrations, seed, and the Prisma client singleton. |
| `@mom/core` | Framework-agnostic business logic & AI engine (placeholder in Phase 0). |
| `apps/web` | Next.js frontend + thin API layer (placeholder in Phase 0). |

## Getting started

Requires Node 20+ and a PostgreSQL database.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (runs with mock AI + local storage, no keys needed)
cp .env.example .env
#   set DATABASE_URL to your local Postgres

# 3. Generate the Prisma client
npm run db:generate

# 4. Create the schema + seed a demo tenant
npm run db:migrate
npm run db:seed
```

### Available scripts

| Script | Description |
| --- | --- |
| `npm run db:generate` | Generate the Prisma client. |
| `npm run db:migrate` | Create/apply a dev migration. |
| `npm run db:seed` | Seed a demo workspace + business. |
| `npm run db:studio` | Open Prisma Studio. |
| `npm run typecheck` | Type-check all workspaces. |

## Configuration

All configuration is via environment variables (see `.env.example`). The app
runs with **no real credentials** in MVP mode:

- `AI_PROVIDER=mock` — deterministic local generation, no API key.
- `STORAGE_PROVIDER=local` — uploads saved to disk.

Swap to real providers (`openai`, `r2`) by changing those variables and
supplying their keys. Secrets are server-side only and never committed.
