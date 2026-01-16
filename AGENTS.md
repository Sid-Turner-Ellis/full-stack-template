# AGENTS

**Purpose**

- This file guides agentic coding assistants working in this repo.
- Keep commands and style aligned with repository config and patterns.

**Repository**

- Next.js 15 App Router with React 19.
- tRPC + React Query for API/client data.
- Prisma ORM with SQLite for local dev.
- NextAuth (beta) for authentication.
- Tailwind CSS v4 with shadcn UI components.

**File Structure**

- `src/app` is the App Router; routes live in nested folders with `page.tsx`, `layout.tsx`.
- `src/app/api/**/route.ts` contains Next.js route handlers (API endpoints).
- `src/app/_components` holds app-level components.
- `src/app/_components/ui` contains shadcn-style UI primitives.
- `src/app/_hooks`, `src/app/_lib`, `src/app/_styles` hold client hooks, helpers, and globals.
- `src/server` is server-only code: `api/` (tRPC), `lib/` (infra utils), `services/` (business logic), `workflows/` (Upstash).
- `src/shared` contains shared client/server helpers (e.g. React Query config).
- `prisma/` contains schema, migrations, seed script, and local SQLite db.
- `public/` hosts static assets.
- `docs/` holds product and API notes (see `docs/project-spec-v2.txt`).
- `generated/` and `.next/` are build outputs; do not edit.

**Commands**

- Install: `npm install`
- Dev server: `npm run dev` (Next dev with turbo)
- Build: `npm run build`
- Start (prod): `npm run start`
- Preview: `npm run preview` (build then start)
- Lint: `npm run lint`
- Lint fix: `npm run lint:fix`
- Typecheck: `npm run typecheck` (tsc --noEmit)
- Check (lint + typecheck): `npm run check`
- Format check: `npm run format:check`
- Format write: `npm run format:write`

**Database / Prisma**

- Schema: `prisma/schema.prisma`.
- Local db: `prisma/db.sqlite`.
- Generate client (dev migrate): `npm run db:generate`.
- Deploy migrations: `npm run db:migrate`.
- Push schema (no migrations): `npm run db:push`.
- Seed data: `npm run db:seed`.
- Studio UI: `npm run db:studio`.
- Prisma client also generates on `postinstall`.

**Tests**

- No test runner configured in package.json.
- No test files detected (no `*.test.*` or `__tests__`).
- Single-test command: N/A until a test runner is added.
- Use `npm run check` for CI-style validation.

**Formatting**

- Prettier is configured in `prettier.config.js`.
- Tailwind class sorting is handled by `prettier-plugin-tailwindcss`.
- Run `npm run format:write` to normalize spacing and ordering.
- Avoid manual formatting changes that fight Prettier.
- Prefer formatting touched files only to keep diffs small.

**Linting**

- ESLint uses Next core-web-vitals + TypeScript ESLint configs.
- `@typescript-eslint/consistent-type-imports` prefers inline `type` imports.
- `@typescript-eslint/no-unused-vars` ignores args prefixed with `_`.
- `@typescript-eslint/no-misused-promises` is strict for async handlers.
- Unused disable directives are reported; remove stale `eslint-disable`.

**Imports**

- Group imports: external packages, then internal `~/` modules.
- Prefer inline type imports: `import { type Foo } from "..."`.
- Keep "use client" or `import "server-only"` at the very top.
- Use the `~/` alias for `src` paths (from tsconfig).
- Leave a blank line between import groups.

**TypeScript**

- `strict` and `noUncheckedIndexedAccess` are enabled; handle undefined cases.
- Use `readonly` or `Readonly<>` where data should not mutate.
- Avoid `any`; prefer explicit types and Zod inference.
- Use Zod schemas for input validation (`z.object`, `safeParse`).
- Prefer `as const` for literal unions where appropriate.
- Favor `type` imports for types to satisfy ESLint.

**React / Next**

- App Router conventions: `page.tsx`, `layout.tsx`, `route.ts`.
- Server components are default; add "use client" only when necessary.
- Put client-only hooks and components under `src/app/_hooks` and `_components`.
- Use `NextResponse.json` for API responses in route handlers.
- Use `React.ReactNode` for children props (see `src/app/layout.tsx`).
- Use `import "server-only"` for server-only helpers in `src/server/**`.

**API Routes**

- Place route handlers under `src/app/api/**/route.ts`.
- Validate request bodies with Zod and return 400 on invalid input.
- Use 409 for conflicts and 404 for not found when appropriate.
- Keep handlers thin; delegate to services or tRPC when possible.

**tRPC**

- Routers live in `src/server/api/routers`.
- Use `createTRPCRouter`, `publicProcedure`, `protectedProcedure`.
- Throw `TRPCError` for expected error cases.
- Use Zod for inputs and explicit output unions for client typing.
- RSC helpers are in `src/server/lib/trpc.ts` and `src/app/_lib/trpc.tsx`.
- Prefer returning typed error unions in mutations for validation errors.

**React Query**

- Query client defaults live in `src/shared/lib/react-query.ts`.
- Prefer `DEFAULT_QUERY_CLIENT_CONFIG` when creating clients.
- Client uses a singleton pattern in the browser (see `src/app/_lib/trpc.tsx`).

**Auth**

- NextAuth config is in `src/server/lib/next-auth.ts`.
- Auth routes live under `src/app/api/auth`.
- Use `auth()` from `src/server/lib/next-auth.ts` in server context.
- Keep password hashing centralized (do not duplicate logic).
- Avoid direct session access in client components; prefer server-side auth.

**Error Handling**

- Validate external input early and return/throw consistent errors.
- For API routes, use status codes and `{ error: "..." }` payloads.
- For tRPC, return typed error unions or throw `TRPCError`.
- Avoid silent catches; log only actionable errors.
- Prefer `safeParse` for request bodies and return 400 on invalid input.

**Naming**

- Components: `PascalCase`.
- Functions/variables: `camelCase`.
- Constants: `UPPER_SNAKE_CASE`.
- Files: prefer `kebab-case` (matches `report-generate-form.tsx`).
- App-level folders use `_components`, `_lib`, `_hooks`, `_styles`.

**CSS / Tailwind**

- Base styles live in `src/app/_styles/globals.css`.
- Tailwind v4 is loaded via `@import "tailwindcss";`.
- Theme tokens are CSS variables in `:root` and `.dark`.
- Use `cn` from `src/app/_lib/utils.ts` to merge classes.
- Keep UI primitives in `src/app/_components/ui`.
- Favor theme variables over hard-coded colors.

**Data / Services**

- Server-side services live in `src/server/services`.
- Server-only utilities live in `src/server/lib` and may import "server-only".
- Shared client/server helpers live in `src/shared/lib`.
- Access Prisma via `db` from `src/server/lib/db.ts`.
- Keep business logic in services; keep route handlers thin.

**Environment Variables**

- Env schema is defined in `src/env.js` using `@t3-oss/env-nextjs`.
- Only expose client values via `NEXT_PUBLIC_` prefix.
- Avoid direct `process.env` access outside `src/env.js`.
- `SKIP_ENV_VALIDATION=1` skips validation for builds.
- Add new vars to both schema and `runtimeEnv`.

**Docs**

- Primary product spec: `docs/project-spec-v2.txt` (Time-Horizon Gated Ladder).
- Supporting references live in `docs/`.
- Treat docs as source-of-truth for product requirements.

**Generated / External**

- Do not edit `generated/` or `.next/` outputs.
- `prisma/db.sqlite` is a local dev artifact.
- Avoid committing secrets or `.env` files.
- Do not hand-edit files in `node_modules/`.

**Cursor / Copilot Rules**

- No `.cursor/rules`, `.cursorrules`, or `.github/copilot-instructions.md` found.
