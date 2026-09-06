# admin — App Guide (`apps/admin`)

Staff panel. Next.js App Router, **English-only** (`texts.ts` per page, no i18n).
Port **3001**. Read the root `/AGENTS.md` first; this file wins inside `apps/admin`.

## Map

```
src/
├── app/
│   ├── layout.tsx                 root shell: fonts, Providers, Toaster
│   ├── error.tsx · loading.tsx · not-found.tsx
│   ├── (auth)/login/              4-file page, centered layout, no sidebar
│   ├── (dashboard)/
│   │   ├── layout.tsx             sidebar + header shell
│   │   ├── page.tsx               dashboard home (stats)
│   │   ├── posts/                 full CRUD reference: table, filters, drawer form, publish, delete
│   │   └── users/                 read-only list
│   └── api/
│       ├── auth/{login,logout,session}      auth.handlers.*
│       ├── backend/[...path]                auth.proxy (BFF, /admin/v1/* only)
│       └── health
├── components/   providers · page-shell · app-sidebar · site-header · can · auth-events
├── config/       navigation.ts (sidebar entries + permission per item)
├── lib/          auth.server.ts · routes.ts
├── styles/       globals.css
└── proxy.ts      chain([requestId, securityHeaders, authGuard])
```

## Page contract (strict, four files)

```
(dashboard)/<route>/
├── page.tsx               Server Component. <PageShell title={TEXTS.PAGE_TITLE}><Index/></PageShell>
├── loading.tsx            TableSkeleton or equivalent
└── components/
    ├── index.tsx          "use client". export function Index(). const vm = useData(). JSX only.
    ├── index.hook.ts      "use client". export function useData(). Dividers: State / APIs / Form / Handlers / LifeCycles / Return
    ├── texts.ts           export const TEXTS = {...} as const
    └── <feature>/         children of this page (e.g. post-form-drawer/)
```

`(dashboard)/components/` is **only** for shared chrome; feature UI lives under its route.

## Patterns to copy from `posts/`

- `useTableFilters()` → `table.query` feeds the list hook; `table.setSearch/setFilter/setPage`.
- Drawer forms: `useForm<CreateXInput>` with `zodResolver(createXSchema)`; the form instance is
  returned from `useData()` and passed to the drawer as a prop.
- Mutations: `useCreateX({ onSuccess: toast + close, onError: applyServerErrors(form, error) })`.
  Cache invalidation is inside the service hook — never call `queryClient` from a page.
- Permission gating: `<Can permission="posts.delete">…</Can>`; nav items declare `permission`.
- Delete: `ConfirmDialog` with `destructive`, driven by `deleteTarget` state.

## Rules

- All copy from `TEXTS`. No `t()`, no inline strings in JSX.
- Every list renders loading (`DataTable isLoading`), error (`ErrorState`) and empty states.
- Login success and logout use `window.location.assign` so the edge guard re-evaluates with fresh cookies.
- Routes are constants in `lib/routes.ts`; sidebar entries in `config/navigation.ts`.

## Commands

```bash
pnpm admin               # dev on :3001
pnpm nx build admin
pnpm nx lint admin && pnpm nx typecheck admin && pnpm nx test admin
pnpm nx e2e admin-e2e
pnpm g:page --app=admin --path=<route> --name=<Name>
```
