# web — App Guide (`apps/web`)

Public, localized app. Next.js App Router, next-intl, RTL for `fa`. Port **3000**.
Read the root `/AGENTS.md` first; this file wins inside `apps/web`.

## Map

```
src/
├── app/
│   ├── layout.tsx                  pass-through (document shell is in [locale]/layout.tsx)
│   ├── not-found.tsx · global-error.tsx · robots.ts · sitemap.ts
│   ├── [locale]/
│   │   ├── layout.tsx              <html lang dir>, fonts, NextIntlClientProvider, Providers, Header/Footer
│   │   ├── page.tsx                home
│   │   ├── posts/                  list (page + components/index.tsx + index.hook.ts) and [slug]/ (server-only)
│   │   ├── login/                  3-file page, react-hook-form + loginSchema
│   │   └── account/                protected by proxy.ts guard
│   └── api/
│       ├── auth/{login,register,logout,session}   auth.handlers.*
│       ├── backend/[...path]                      auth.proxy (BFF, /customer/v1/* only)
│       ├── revalidate                             backend → Data Cache invalidation
│       └── health
├── components/     providers.tsx (transport setup + providers), header, footer, locale-switcher, auth-events
├── i18n/           routing.ts · request.ts · navigation.ts   (Link/useRouter come from here, never next/link)
├── lib/            auth.server.ts · locale-params.ts · cache-tags.ts · posts.ts (server fetch) · seo.ts
├── stores/         preferences.store.ts (zustand, persisted)
├── hooks/          use-format-money.ts
├── styles/         globals.css (imports @repo/ui/styles.css)
└── proxy.ts        chain([requestId, securityHeaders, authGuard, intl])
```

## Page contract (strict)

```
[locale]/<route>/
├── page.tsx                Server Component. generateMetadata, resolveLocaleParams(params) first,
│                           server fetch via src/lib helper → raw payload as props, notFound().
├── loading.tsx             for streaming segments
└── components/
    ├── index.tsx           "use client". Presentational. Every string via t("key").
    └── index.hook.ts       "use client". useXPage(). React Query from @repo/services only here.
```

A server-only page (no interactivity, e.g. `posts/[slug]`) may skip `components/`.

Server → client data: pass **raw JSON** (`IPostModel`, `IPaginatedResponseModel`),
never class instances. The hook rebuilds the model (`new PaginatedResponseModel(PostModel, raw)`)
and passes it as `initialData`.

## Rules

- `resolveLocaleParams(params)` is the first line of every page/layout — it validates the locale and enables static rendering.
- Navigation via `@/i18n/navigation` (`Link`, `useRouter`, `redirect`). Never `next/link` or `next/navigation`'s router.
- Copy in `messages/<locale>.json`, namespaced per page. Add every key to **all** locales.
- Logical CSS only; verify each new screen in `/fa`.
- Money via `useFormatMoney()`; dates via `formatDate(value, locale)`.
- Server fetch helpers in `src/lib/*.ts` are `server-only`, `cache()`-wrapped and **fail soft** (return a status union, never throw for outages) so the site builds and renders without the backend.
- Cache tags are a cross-repo contract (`lib/cache-tags.ts`).
- Protected segments are declared once in `proxy.ts` (`isProtected`).

## Commands

```bash
pnpm web                 # dev on :3000
pnpm nx build web
pnpm nx lint web && pnpm nx typecheck web && pnpm nx test web
pnpm nx e2e web-e2e
pnpm g:page --app=web --path=<route> --name=<Name>
```
