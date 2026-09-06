# Boilerplate — Next.js Monorepo Starter

A production-grade starting point for multi-app Next.js products: a public,
localized **web** app and an English-only **admin** panel, sharing one typed
data layer. Built on Nx + pnpm, Next.js 16 (App Router), React 19, Tailwind 4,
shadcn/ui, TanStack Query 5, Zustand 5, Zod 4 and next-intl 4.

It exists so the next project starts at "add your first domain", not at
"decide where HTTP lives". Every recurring decision — auth, env validation,
i18n/RTL, module boundaries, the shape of a page, the shape of a service —
is already made, documented, and enforced by lint.

> **Agents:** read [`AGENTS.md`](./AGENTS.md) first. It is the canon; this
> README is the human tour.

---

## Contents

1. [Quick start](#quick-start)
2. [What you get](#what-you-get)
3. [Repository layout](#repository-layout)
4. [Architecture in one picture](#architecture-in-one-picture)
5. [Daily commands](#daily-commands)
6. [Adding things](#adding-things)
7. [Environment](#environment)
8. [Auth model](#auth-model)
9. [i18n and RTL](#i18n-and-rtl)
10. [Testing](#testing)
11. [CI, Docker, deploy](#ci-docker-deploy)
12. [Starting a new project from this template](#starting-a-new-project-from-this-template)
13. [Further reading](#further-reading)

---

## Quick start

Requirements: **Node ≥ 22**, **pnpm ≥ 10** (`corepack enable` gives you the pinned version).

```bash
git init && git checkout -b develop   # `nx affected` needs a git history (defaultBase: develop)
pnpm install
cp .env.example .env            # then fill in the API URL
pnpm web                        # http://localhost:3000  (public app)
pnpm admin                      # http://localhost:3001  (admin app)
```

Quality gates you will run before every commit:

```bash
pnpm check                      # lint + typecheck + unit tests for affected projects
```

---

## What you get

| Concern | Decision | Where |
|---|---|---|
| Monorepo | Nx 23 + pnpm workspaces, TypeScript project references | `nx.json`, `pnpm-workspace.yaml` |
| Framework | Next.js 16 App Router, React 19, RSC-first pages | `apps/*` |
| Styling | Tailwind 4, shadcn/ui on the unified `radix-ui` package, `next-themes` | `libs/ui` |
| Data | TanStack Query 5 behind typed domain hooks; one `apiClient` | `libs/services` |
| Contracts | Zod 4 schemas with `z.infer` — never hand-written parallel types | `libs/dtos` |
| Domain shapes | `IXModel` raw interface + `XModel` class with null-safe getters | `libs/models` |
| Auth | Backend JWT pair in **httpOnly cookies**, same-origin BFF proxy with single-flight refresh | `libs/auth` |
| Middleware | Composable chain: request-id, security headers, auth guard, redirects, next-intl | `libs/middleware` |
| Env | Zod-validated, split into public/server accessors; no scattered `process.env` | `libs/config` |
| i18n | next-intl, `en` + `fa`, RTL via logical CSS properties | `apps/web/src/i18n`, `libs/config` |
| State | Zustand for cross-page client state; React Query for server state | `apps/*/src/stores` |
| Boundaries | `@nx/enforce-module-boundaries` with `type:*` tags — **enforced**, not advisory | `eslint.config.mjs` |
| Generators | `pnpm g:page`, `pnpm g:domain` scaffold a page / a full vertical slice | `tools/workspace-plugin` |
| Testing | Vitest + Testing Library for libs and components, Playwright per app | `libs/testing`, `apps/*-e2e` |
| Storybook | Component workshop for `libs/ui` | `libs/ui/.storybook` |
| Delivery | Multi-stage Dockerfile (standalone output), GitHub Actions + GitLab CI | `Dockerfile`, `.github`, `.gitlab-ci.yml` |

---

## Repository layout

```
.
├── apps/
│   ├── web/                 # Public app: localized, SEO-aware, customer auth      tag: type:app, scope:web
│   ├── web-e2e/             # Playwright suite for web
│   ├── admin/               # Admin panel: English-only, sidebar shell, RBAC       tag: type:app, scope:admin
│   └── admin-e2e/
├── libs/
│   ├── config/              # Locales, API prefixes, cookie names, env accessors    type:config
│   ├── enums/               # Shared enums                                          type:enum
│   ├── models/              # Domain models (interface + class)                     type:model
│   ├── dtos/                # Zod schemas + inferred types                          type:dto
│   ├── utils/               # Pure helpers + generic React hooks                    type:util
│   ├── services/            # apiClient, endpoints, <x>.api / .hooks / .query-keys  type:service
│   ├── auth/                # /server: cookies, handlers, BFF proxy. /client: transport, useCan   type:auth
│   ├── middleware/          # chain(), withAuthGuard, withSecurityHeaders, ...      type:middleware
│   ├── ui/                  # shadcn primitives + composed blocks (data-agnostic)   type:ui
│   └── testing/             # render-with-providers, msw-free fakes                 type:testing
├── tools/workspace-plugin/  # Nx generators: page, domain
├── docs/                    # Architecture, conventions, ADRs, guides
├── AGENTS.md                # Rules for AI agents (and humans)
└── CLAUDE.md                # @AGENTS.md
```

Import libraries by package name, never by relative path across libs:

```ts
import { PostModel } from "@repo/models";
import { usePostsList } from "@repo/services";
import { Button } from "@repo/ui/button";
import { createAuth } from "@repo/auth/server";
```

---

## Architecture in one picture

```
             ┌────────────────────────── browser ───────────────────────────┐
             │  page.tsx (RSC)  →  components/index.tsx  ←  index.hook.ts   │
             │                                                │             │
             │                                    @repo/services hooks      │
             │                                                │             │
             │                                    <x>.api.ts → apiClient    │
             └───────────────┬──────────────────────────────────┬───────────┘
        public /general/*    │                    authenticated │ /customer/* or /admin/*
                             ▼                                  ▼
                      Backend API  ◄────────────  /api/backend/[...path]  (BFF proxy, httpOnly cookies)
```

**Dependency direction is a hard rule** (enforced by ESLint):

```
app → service, ui, auth, middleware, config, dto, model, util, enum, testing
service → config, dto, model, util, enum
auth → config, services, models, utils
middleware → config
ui → util, config, (model | dto as type-only)
dto → enum   ·   model → enum, model   ·   util, enum, config → nothing
```

Read [docs/architecture.md](./docs/architecture.md) for the reasoning behind each layer.

---

## Daily commands

```bash
# run
pnpm web                       # nx dev web
pnpm admin                     # nx dev admin
pnpm storybook                 # nx storybook ui

# quality
pnpm lint                      # nx affected -t lint
pnpm typecheck                 # nx affected -t typecheck
pnpm test                      # nx affected -t test
pnpm check                     # all three, affected only
pnpm check:all                 # all three, every project
pnpm e2e                       # nx run-many -t e2e

# build
pnpm build                     # nx run-many -t build
pnpm build:web / build:admin

# workspace
pnpm nx graph                  # dependency graph in the browser
pnpm nx sync                   # refresh TS project references after new imports
pnpm format                    # prettier --write
```

Always go through Nx (`pnpm nx ...`) rather than calling `next`, `vitest` or
`eslint` directly: caching, affected detection and reference sync depend on it.

---

## Adding things

### A page

```bash
pnpm g:page --app=admin --path=catalog/brands --name=Brands
pnpm g:page --app=web --path=blog --name=Blog
```

Generates the mandated files for that app (see [docs/conventions.md](./docs/conventions.md#page-contract)):

```
<route>/
├── page.tsx                 # Server Component: metadata + shell + <Index/>
└── components/
    ├── index.tsx            # presentational, calls useData() once
    ├── index.hook.ts        # useData(): state / APIs / form / handlers / return
    └── texts.ts             # admin only — static English copy
```

### A domain (model + dto + endpoints + api + hooks + query keys)

```bash
pnpm g:domain --name=brand --audience=admin
```

Then wire the endpoint paths in `libs/services/src/lib/shared/endpoints.ts`
and export the domain from each lib's `index.ts` (the generator prints the
exact lines).

### A new app

```bash
pnpm nx g @nx/next:app apps/portal --style=css --appDir --src
```

Then follow [docs/new-app-checklist.md](./docs/new-app-checklist.md) — it
wires providers, auth, middleware, tags and CI in about ten minutes.

### A shadcn component

```bash
pnpm dlx shadcn@latest add dialog --cwd libs/ui
```

Components land in `libs/ui/src/components/`; export them from the package
`exports` map in `libs/ui/package.json` (one line per component).

---

## Environment

`.env.example` documents every variable. The rules:

- `NEXT_PUBLIC_*` is **only** for values that are safe in the browser bundle.
- Server code reads env through `getServerEnv()`; client code through
  `getPublicEnv()` (both in `@repo/config`). Neither ever reads `process.env`
  inline elsewhere — validation happens once, with a readable error.
- Missing or malformed values fail at startup, not on the first request.

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | browser | Backend origin for public endpoints and CSP `connect-src` |
| `INTERNAL_API_BASE_URL` | server | Backend origin as seen from the server / proxy |
| `NEXT_PUBLIC_APP_URL` | browser | Canonical site origin for metadata and sitemaps |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | browser | Fallback locale (`en`) |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | browser | Base currency the catalog is priced in |
| `AUTH_COOKIE_SECURE` | server | Force `Secure` cookies on/off (staging over http) |
| `REVALIDATE_SECRET` | server | Guards `POST /api/revalidate` |
| `SITE_ROBOTS_INDEX` | server | `false` keeps staging out of search engines |

---

## Auth model

Tokens never touch client JavaScript.

1. The browser POSTs credentials to the app's own `/api/auth/login`.
2. The route handler calls the backend, receives a JWT pair, writes it into
   **httpOnly cookies** and returns only the user object.
3. Authenticated API calls go to same-origin `/api/backend/<audience>/v1/...`.
   The BFF proxy attaches the Bearer token, forwards, and on a 401 refreshes
   the pair once (single-flight), rotates cookies and retries.
4. `apiClient` raises an `auth:unauthorized` window event when a 401 survives
   the refresh; each app decides what to do (dialog in web, redirect in admin).
5. The edge middleware guard only checks cookie presence + `exp`; the API is
   the real security boundary.

Everything is created by one call per app:

```ts
// apps/admin/src/lib/auth.server.ts
export const auth = createAuth({ appId: "admin", audience: "admin", backendBaseUrl, secureCookies });
```

Details, sequence diagrams and threat notes: [docs/auth.md](./docs/auth.md).

---

## i18n and RTL

- Locales live once in `@repo/config` (`LOCALES`, `DEFAULT_LOCALE`, `RTL_LOCALES`).
- The web app nests every route under `[locale]`, sets `<html dir>` from the
  locale, and loads messages from `apps/web/messages/<locale>.json`.
- **Never** hardcode user-facing strings in web — `t("key")` always.
- **Always** use logical Tailwind utilities: `ms-* me-* ps-* pe-* start-* end-* text-start`.
  Physical `ml/mr/left/right` are lint errors.
- Money, numbers and dates go through `formatMoney`, `formatNumber`,
  `formatDate` from `@repo/utils` — never `toLocaleString` inline.
- The admin app is English-only and uses `texts.ts` per page instead.

---

## Testing

| Layer | Tool | Command |
|---|---|---|
| utils, models, dtos, services | Vitest (node) | `pnpm nx test utils` |
| ui, app components | Vitest + jsdom + Testing Library | `pnpm nx test ui` |
| apps end-to-end | Playwright | `pnpm nx e2e web-e2e` |

`@repo/testing` exports `renderWithProviders` (QueryClient + theme + intl) and
`createTestQueryClient`. Tests sit next to the code as `*.spec.ts(x)`.

---

## CI, Docker, deploy

- **GitHub Actions** (`.github/workflows/ci.yml`): lint, typecheck, test, build on
  affected projects; e2e on PRs to `main`.
- **GitLab CI** (`.gitlab-ci.yml` + `.ci/*.yml`): branch-name policy, code style,
  per-app Docker image build with a secret env file, Helm deploy per environment.
- **Dockerfile**: multi-stage, `APP_NAME` build arg, Next `standalone` output,
  distroless runtime, non-root. `docker build --build-arg APP_NAME=admin .`

---

## Starting a new project from this template

1. Clone, then `pnpm dlx degit` or copy — remove `.git` and `git init`.
2. Search-and-replace `@repo/` with your package scope if you want one (optional).
3. Update `LOCALES` in `libs/config/src/lib/locales.ts` and the DTO locale list.
4. Point `.env` at your backend; adjust `API_PREFIX` if the backend uses other namespaces.
5. Delete the example `posts` domain and page, or keep them as the reference implementation.
6. Update `AGENTS.md` "Project" section with the product name and business rules.
7. Run `pnpm check:all` — it must be green before the first commit.

---

## Further reading

- [AGENTS.md](./AGENTS.md) — rules of the repo, for agents and reviewers
- [docs/architecture.md](./docs/architecture.md) — layers, boundaries, data flow
- [docs/conventions.md](./docs/conventions.md) — code, model, DTO, page and git conventions
- [docs/auth.md](./docs/auth.md) — cookie auth and BFF proxy in depth
- [docs/adding-a-domain.md](./docs/adding-a-domain.md) — the vertical-slice walkthrough
- [docs/testing.md](./docs/testing.md) — what to test at each layer, and with what
- [docs/gotchas.md](./docs/gotchas.md) — the traps this setup already works around
- [docs/new-app-checklist.md](./docs/new-app-checklist.md) — bringing up a third app
- [libs/ui/README.md](./libs/ui/README.md) — adding shadcn components and blocks
- [docs/adr/](./docs/adr) — architecture decision records
