# AI Agent Guidelines

> Read the nearest nested `AGENTS.md` first. This root file is repo-wide canon;
> `apps/web/AGENTS.md` and `apps/admin/AGENTS.md` add app-specific rules that
> win inside their app. `CLAUDE.md` files only `@`-include the matching
> `AGENTS.md`, so every agent reads the same source.

## Project

<!-- Replace this block when you start a real project. -->
A multi-app Next.js product: `web` (public, localized) and `admin` (staff panel).
The backend is a separate REST API (Laravel-style envelopes: `{ data }` and
`{ data, _paginate }`). This repo has **no database access** and never will.

---

## Non-negotiables (check before every change)

1. **Layered data flow, never skipped:**
   `Backend → apiClient → <x>.api.ts → <x>.hooks.ts → page index.hook.ts → index.tsx`
2. **HTTP only in `libs/services/**/*.api.ts` via `apiClient`**, plus the
   route handlers in `libs/auth/server` and `apps/*/src/app/api/**`. No `fetch`,
   `axios`, or `apiClient` anywhere else — including `libs/ui` and app components.
3. **React Query only in `libs/services/**/*.hooks.ts` and a page's `index.hook.ts`.**
   Query keys come from `<x>.query-keys.ts`; cache invalidation lives in the
   service hook; toasts / navigation / dialogs live in the app via `options`.
4. **Module boundaries are enforced by ESLint** (`@nx/enforce-module-boundaries`).
   If lint fails on a dependency, the fix is to move code, not to loosen the rule.
5. **Contracts are Zod schemas in `libs/dtos`**, types via `z.infer`. Never
   hand-write a parallel type. Validate at every trust boundary (form submit,
   route handler body, env).
6. **Env through `@repo/config` accessors only.** `NEXT_PUBLIC_*` is for truly
   public values. Server secrets never get the prefix and never get committed.
7. **No `console.*` in shipped code.** Surface errors through UI (`sonner`) and
   `ApiClientError`. The one allowed logger is `@repo/utils` `logger` (server-side).
8. **Web is fully localized; admin is English-only.** In web every string is
   `t("key")`; in admin every string comes from the page's `texts.ts`.
9. **Logical CSS only** (`ms/me/ps/pe/start/end/text-start`). Physical
   directions fail lint.
10. **Money/number/date formatting only through `@repo/utils`** formatters.

---

## Monorepo map

```
apps/web, apps/admin            type:app   (scope:web / scope:admin)
libs/config                     type:config
libs/enums                      type:enum
libs/models                     type:model
libs/dtos                       type:dto
libs/utils                      type:util
libs/services                   type:service
libs/auth                       type:auth      (exports: @repo/auth/server, @repo/auth/client)
libs/middleware                 type:middleware
libs/ui                         type:ui        (exports: @repo/ui/<component>, @repo/ui/blocks/<name>, @repo/ui/styles.css — no root export)
libs/testing                    type:testing
tools/workspace-plugin          generators: page, domain
```

Allowed dependency direction (also encoded in `eslint.config.mjs`):

```
type:app        → service, ui, auth, middleware, config, dto, model, util, enum, testing
type:service    → config, dto, model, util, enum
type:auth       → config, service, model, util
type:middleware → config
type:ui         → util, config, model (type-only), dto (type-only)
type:dto        → enum
type:model      → model, enum
type:util       → enum
type:enum       → (nothing)
type:config     → (nothing)
type:testing    → service, ui, config
```

Import from package roots only: `@repo/services`, `@repo/models`, … The only
subpaths that exist are the ones declared in each lib's `package.json`
`exports` (`@repo/ui/button`, `@repo/ui/blocks/data-table`, `@repo/auth/server`,
`@repo/auth/client`). Deep relative imports across libs are a lint error.

Read [docs/gotchas.md](./docs/gotchas.md) before changing middleware config,
env schemas, coerced DTO fields, or anything that crosses the RSC boundary —
each entry there is a trap this setup already works around.

---

## Tech stack (pinned in package.json — do not downgrade)

| Area | Choice |
|---|---|
| Framework | Next.js 16 App Router, React 19 |
| Language | TypeScript strict, `module: esnext` + `moduleResolution: bundler`, project references |
| Styling | Tailwind 4 (`@theme` tokens in `libs/ui/src/styles/globals.css`), shadcn/ui on `radix-ui` |
| Data | TanStack Query 5 |
| State | Zustand 5 (client state only), React Query (server state) |
| Forms | react-hook-form + `@hookform/resolvers/zod` + Zod 4 |
| i18n | next-intl 4 (web only) |
| Icons | lucide-react |
| Toasts | sonner |
| Tests | Vitest + Testing Library, Playwright |
| Monorepo | Nx 23, pnpm |

---

## Commands (always via Nx)

```bash
pnpm web / pnpm admin                    # dev servers
pnpm check                               # lint + typecheck + test (affected) — the minimum bar
pnpm nx affected -t lint typecheck test  # same thing, explicit
pnpm nx sync                             # after any new cross-lib import
pnpm g:page --app=admin --path=x --name=X
pnpm g:domain --name=x --audience=admin
```

Nx MCP server is configured in `.mcp.json`; prefer `nx_project_details` over
guessing project config.

---

## Page contract

### web (`apps/web/src/app/[locale]/<route>/`)

```
page.tsx                 Server Component only. metadata/generateMetadata, server fetch via
                         @repo/services api fns or src/lib helpers, notFound(), pass props down.
components/index.tsx     "use client". Presentational. All copy via t("key").
components/index.hook.ts "use client". Descriptive name (usePostPage). React Query via @repo/services only here.
```

### admin (`apps/admin/src/app/(dashboard)/<route>/`)

```
page.tsx                 Server Component. <PageShell title={TEXTS.PAGE_TITLE}><Index/></PageShell>
components/index.tsx     "use client". export function Index(). const vm = useData(); JSX only.
components/index.hook.ts "use client". export function useData(). Block-comment dividers:
                         /* ---- State ---- */ /* ---- APIs ---- */ /* ---- Form ---- */
                         /* ---- Handlers ---- */ /* ---- LifeCycles ---- */ /* ---- Return ---- */
components/texts.ts      export const TEXTS = { ... } as const
components/<feature>/    child components of this page only. Shared chrome lives in (dashboard)/components/.
```

Every fetching page renders **loading, error and empty** states. Add
`loading.tsx` / `error.tsx` for new route segments that don't inherit one.

---

## Service contract

```
libs/services/src/lib/<x>/
  <x>.query-keys.ts   export const X_QUERY_KEY = ["x"] as const; export const xKeys = { all, list(params), detail(id) }
  <x>.api.ts          pure functions; apiClient in, Model out. `new XModel(raw.data)` / `new PaginatedResponseModel(XModel, raw)`
  <x>.hooks.ts        useXList / useX / useCreateX / useUpdateX / useDeleteX via shared useQuery/useMutation
  index.ts            export * from the three files
```

`useMutation` from `../shared/hooks` takes `{ mutationFn, invalidates, options }` —
`invalidates` is the hook's responsibility; `options.onSuccess` is the caller's.

---

## Model & DTO contract

- `libs/models/src/lib/<x>/<x>.interface.ts`: `export type IXModel = IBaseModel & { …raw snake_case fields }`
- `libs/models/src/lib/<x>/<x>.model.ts`: `export class XModel extends BaseModel<IXModel>` with getters
  (`getName()`, `isActive()`, `getCover(): MediaModel | null`). No fetching, no mutation, no business workflows.
- `libs/dtos/src/lib/<x>/<x>.dto.ts`: `export const createXSchema = z.object({...})`,
  `export type CreateXDto = z.infer<typeof createXSchema>`. Use `z.input<>` for the pre-default shape.
- Localized fields are `Record<locale, string>`; use `localizedStringSchema()` and `pickLocalized()`.

---

## Coding rules

- Named exports. `export default` only where Next requires it (`page`, `layout`, route files, `proxy`).
- `type` over `interface` for new declarations.
- JSDoc one-liner on every exported function/hook/component; document non-obvious params.
- No dead code, no commented-out blocks, no unused props.
- Client components start with `"use client"`; server-only modules import `"server-only"`.
- Prefer `React.FC<Props>` arrow components in `libs/ui`; props are named types, never inline.
- Every user-visible string in `libs/ui` arrives via props (`texts`) with defaults — the lib knows no i18n.
- Accessibility is not optional: labels, `aria-*`, focus states, keyboard paths.

---

## Git rules

- Branch from `develop`: `feat/…`, `fix/…`, `chore/…`, `refactor/…`, `docs/…`, `test/…`, `hotfix/…`.
- **One-line imperative commit messages** (`Add brands drawer`). No bodies, no bullets, no emoji.
- **No AI attribution** in commits or PRs (no `Co-Authored-By`, no "Generated with…").
- Author is the developer running the agent. Fix mistakes with `git commit --amend --reset-author`.
- Before `checkpoint`: `pnpm check` must pass. Commit only in-scope changes.
- `publish` opens a **draft** PR/MR to `develop`. Never force-push a diverged branch.

### Agent verbs

- **checkpoint** — review `git status`/`git diff`, run `pnpm check`, commit in-scope work with one line.
- **publish** — push and open/update a draft PR (one-line title, short description).
- **sync** — fetch and reconcile with remote; stop and ask if a rebase/merge choice is non-trivial.

---

## Review checklist

- [ ] Page follows the app's file contract; hook named per app rule; block-comment dividers.
- [ ] No `fetch`/`axios`/`apiClient` outside `*.api.ts` and route handlers.
- [ ] React Query only in `*.hooks.ts` / `index.hook.ts`; keys from `*.query-keys.ts`.
- [ ] Zod schema from `@repo/dtos` with `z.infer`; forms use `zodResolver`.
- [ ] Loading + error + empty states; `notFound()` for missing entities.
- [ ] Web: `t()` everywhere, logical CSS, checked in `fa` (RTL). Admin: `TEXTS` everywhere.
- [ ] Money/date/number via `@repo/utils`.
- [ ] `pnpm check` green; `pnpm nx sync` run if imports changed.
