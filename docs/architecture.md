# Architecture

## Goals

1. **Add a feature by adding files, not by deciding where they go.** Every
   concern has exactly one home.
2. **The browser never holds a secret.** Tokens live in httpOnly cookies; the
   app's own server is the only thing that talks to the backend with a token.
3. **Shared code is data-agnostic.** `libs/ui` renders props; it does not know
   what a "post" is beyond a type.
4. **Rules are enforced by tooling**, not by memory: ESLint boundaries, Zod at
   boundaries, TypeScript strict, generators for the boilerplate parts.

## Layers

```
┌──────────────┐  routing, layouts, orchestration, UI side effects (toast, navigate)
│   apps/*     │  page.tsx (RSC) · components/index.tsx · components/index.hook.ts
├──────────────┤
│ libs/services│  apiClient · endpoints · <x>.api.ts (pure) · <x>.hooks.ts (React Query) · query keys
├──────────────┤
│ libs/auth    │  server: cookies, handlers, BFF proxy, refresh · client: transport setup, useCan
│ libs/middleware  chain(), withAuthGuard, withSecurityHeaders, withRequestId, withRedirects
├──────────────┤
│ libs/models  │  IXModel (raw API shape) + XModel (getters)
│ libs/dtos    │  Zod schemas + z.infer types
│ libs/enums   │  shared enums
├──────────────┤
│ libs/ui      │  shadcn primitives + composed blocks, all data via props
│ libs/utils   │  pure helpers, formatters, generic hooks
│ libs/config  │  locales, API prefixes, cookie names, env accessors
│ libs/testing │  render helpers for tests
└──────────────┘
```

### Why models are classes

The backend returns snake_case JSON with nullable fields. A class with getters
gives every consumer a stable, null-safe surface (`post.getTitle(locale)`)
without inventing a second camelCase shape that must be kept in sync. Models
never fetch and never contain workflows; that keeps them cheap to construct
and trivial to test.

### Why DTOs are Zod schemas

A schema validates a form (`zodResolver`), validates a route-handler body,
and produces the TypeScript type — three uses from one declaration. The
`z.input<>` type exists for values _before_ defaults are applied (what a
caller passes), `z.infer<>` for values _after_ (what the API receives).

### Why HTTP is confined to `*.api.ts`

One `apiClient` means one place for headers, request ids, currency, timeouts,
error normalization and 401 handling. `*.api.ts` functions are pure and
framework-free, so they run identically in Server Components, route handlers
and the browser.

### Why React Query is confined to hooks

Query keys and invalidation rules are a contract. Putting them next to the
API function that owns the data guarantees a mutation in one screen refreshes
a list in another without either screen knowing about the other.

## Request lifecycle (browser, authenticated)

```
index.hook.ts ──useUpdatePost()──► posts.hooks.ts ──postsApi.update()──► apiClient.patch()
      ▲                                                                       │
      │ toast / close drawer (options.onSuccess)                              │ resolveUrl(): /admin/v1/... → /api/backend/admin/v1/...
      │                                                                       ▼
      │                                                     apps/admin/src/app/api/backend/[...path]/route.ts
      │                                                                       │ Bearer from httpOnly cookie
      │                                                                       │ 401 → refresh once → retry
      └──── invalidate postsKeys.all (hook) ◄──── PostModel ◄──── { data } ◄──┘ backend
```

## Request lifecycle (server component)

```
page.tsx ──► publicPostsApi.getList({}, { next: { revalidate: 60, tags: ["posts"] } })
         ──► apiClient (no transport configured on the server → direct backend URL)
         ──► PaginatedResponseModel → props → <Index initialData=…/>
```

For authenticated server fetches use `serverAuthHeaders(auth.cookieNames)`
from `@repo/auth/server` and pass `{ headers }`.

## Module boundaries

Tags live in each project's `package.json` (`nx.tags`). The rule set is in
`eslint.config.mjs` under `@nx/enforce-module-boundaries`. When a lint error
says a dependency is not allowed, the code is in the wrong layer.

## Apps vs libs — the placement test

| It is…                                               | It goes to…            |
| ---------------------------------------------------- | ---------------------- |
| A URL, a layout, a loading/error boundary            | the app                |
| Wiring providers, auth setup, middleware composition | the app                |
| A store of client state that only one app needs      | the app (`src/stores`) |
| A backend call                                       | `libs/services`        |
| A shape of backend data                              | `libs/models`          |
| A validation rule                                    | `libs/dtos`            |
| A visual component with no data source               | `libs/ui`              |
| A pure function                                      | `libs/utils`           |
| A value that must be identical in every app          | `libs/config`          |

If it does not fit a row, it is almost never the app.
