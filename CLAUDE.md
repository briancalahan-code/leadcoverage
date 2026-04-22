# LeadCoverage

AI-powered B2B marketing intelligence platform. Manages "client brains" (14 intelligence objects), a 7-stage pipeline, and AI-driven personalization via Claude + Clay + HubSpot.

## Monorepo Structure

```
web/                 Next.js frontend (Netlify)
api/                 FastAPI backend (Railway)
supabase/            Supabase config + migrations
docs/
  specs/             Design specifications
  plans/             Implementation plans
  reference/         Domain docs (local only, gitignored)
```

## Web Frontend (`web/`)

Next.js 16, React 19, Supabase SSR, Tailwind 4, TypeScript 5.

```bash
npm run dev      # next dev
npm run build    # next build
npm run start    # next start
```

**Key directories:**

- `src/app/(marketing)/` -- Public landing page
- `src/app/(auth)/` -- Login, register, forgot password
- `src/app/(app)/` -- Authenticated app (dashboard, clients, brain, pipeline, settings, admin)
- `src/app/api/` -- Next.js API routes (client CRUD, brain objects, AI proxy)
- `src/lib/supabase/` -- Supabase client/server/middleware/admin helpers
- `src/types/database.ts` -- TypeScript interfaces for all database tables
- `src/components/` -- Shared components

**Deploy:** Netlify with `@netlify/plugin-nextjs`

**Env vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_API_URL`

## API Backend (`api/`)

Python 3.9+, FastAPI, Uvicorn.

```bash
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

**Key directories:**

- `app/routes/` -- AI, clients, integrations endpoints
- `app/services/` -- Anthropic (Claude), HubSpot, Clay, integration key management
- `app/models/` -- Pydantic models for all database tables

**Health check:** `GET /health`

**Deploy:** Railway (NIXPACKS builder)

**Env vars:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`, `CORS_ORIGINS`

## Database

Supabase (PostgreSQL). Multi-tenant: `org_id` is the tenant boundary, `client_id` is within a tenant. All tables have RLS policies scoped through org membership.

**Brain Objects (14):** company_intelligence, icp_definitions, personas, competitive_map, voice_model, message_matrix, content_index, campaign_history, hubspot_health, review_rules, key_contacts, goals_backwards_math, sow_scope, lc_edge_benchmarks

**Migrations:** `supabase/migrations/` (7 migration files)

## Key Patterns

- API keys stored encrypted via pgcrypto (never plaintext)
- All API routes require Supabase JWT auth
- Singleton brain objects (company_intelligence, voice_model, etc.) use client_id as PK
- Collection brain objects have their own UUID PK + client_id FK
- Many-to-many links via join tables (persona_icp_links, message_persona_links, etc.)
