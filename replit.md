# RADapp — AI Radiology Assistant

RADapp is an AI-powered healthcare web app that transforms complex radiology reports into plain-language explanations for patients and healthcare professionals.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/radapp run dev` — run the frontend (port 24122)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + framer-motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — DB schema (reports.ts, chat_messages.ts)
- `artifacts/api-server/src/routes/` — API route handlers
- `artifacts/radapp/src/pages/` — Frontend pages
- `artifacts/radapp/src/components/` — Shared components (nav.tsx)
- `artifacts/radapp/src/hooks/` — use-auth.tsx, use-theme.tsx
- `artifacts/radapp/src/index.css` — CSS theme (light + dark mode)

## Architecture decisions

- Auth is simulated client-side (localStorage) for hackathon demo purposes — no backend auth
- AI analysis is rule-based pattern matching on report text — can be swapped for OpenAI/Gemini
- Voice playback uses the browser's Web Speech API
- Dark mode defaults on; uses CSS variables + Tailwind class strategy

## Product

- Landing page with hero, features, testimonials, demo report cards
- Login/Signup/Forgot-password auth pages (simulated)
- Dashboard with stats cards, urgency breakdown, recent reports
- Upload page with drag-and-drop + text paste + demo report preloading
- AI Results page with simplified explanation, medical terms, urgency badge, voice playback
- AI Chat page with suggested prompts and real message persistence
- About page with mission, team, values, impact stats
- Light/dark mode toggle

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run codegen after changing `lib/api-spec/openapi.yaml`
- Auth state is in localStorage under key `radapp_user`
- Demo reports are seeded via `executeSql` — run again if DB is wiped
- The API server must be running for dashboard/chat/reports pages to work

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
