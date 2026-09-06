# Gotchas

Every entry below cost real time while building this boilerplate. They are
not hypothetical — each one is a rule the code now depends on.

## `export const config = { matcher }` must be a literal

Next parses the middleware `config` export **statically**, before any module
runs. Importing the array (`matcher: DEFAULT_MATCHER`) fails the production
build with "matcher needs to be a static string or array of static strings",
even though it works in dev.

`DEFAULT_MATCHER` lives in `@repo/middleware` as the canonical value and is
asserted by a test, but each app repeats the literal in its own `proxy.ts`.
Keep the two in sync by hand.

## An empty `.env` value is not an unset value

`FOO=` gives `process.env.FOO === ""`, which fails `z.string().min(16)` and
`z.enum([...]).optional()`. Since `.env.example` ships optional keys with
empty values, a fresh clone could not build until both env schemas started
preprocessing `""` to `undefined`. Any new optional variable must be wrapped
in the `optionalEnv()` helper in `libs/config`.

## Class instances cannot cross the RSC boundary

A Server Component may not pass a `PostModel` to a Client Component — only
plain JSON survives serialization. Server fetch helpers therefore return the
**raw payload** (`model.toJSON()`), and the client hook rebuilds the model
before using it as React Query `initialData`. `PaginatedResponseModel.toJSON()`
exists exactly for this.

## `z.coerce.number()` types its input as `unknown`

That makes any typed object incompatible with the resulting `z.input<>` type,
so `useTableFilters().query` could not be passed to a list hook. The shared
`listQuerySchema` uses an explicit `z.union([z.number(), z.string()…])`
instead, which types the input as `number | string`. Do the same for any new
coerced field.

## String enums are nominal in TypeScript

`"asc"` is **not** assignable to `SortOrderEnum` even though the enum's value
is `"asc"`. This is why `@repo/utils` is allowed to depend on `@repo/enums`
and `useTableFilters` returns `SortOrderEnum`, rather than a string literal
union that would fail at every call site.

## The shadcn CLI writes `@/` aliases

Generated components import `@/lib/utils` and `@/components/button`. Those
aliases do not exist in a library package, so after every `shadcn add` rewrite
them to relative paths (`../lib/utils`, `./button`). See
[libs/ui/README.md](../libs/ui/README.md).

## shadcn primitives ship physical Tailwind directions

`ml-2`, `right-4`, `text-left`, `border-l` appear throughout the generated
components and silently break RTL. Lint rejects them; convert to `ms-2`,
`end-4`, `text-start`, `border-s` when adding a component.

## Libraries have no `build` target — declarations come from `typecheck`

The libs are **source-resolved**: their `exports` point at `src/index.ts` and
`tsconfig.base.json` sets `customConditions: ["@repo/source"]`, so apps compile
lib source directly and Nx's TypeScript plugin gives them no `build` target —
only `typecheck` (`tsc --build --emitDeclarationOnly`), which is what writes
`libs/<name>/dist/*.d.ts`.

Next runs its own `tsc`, which needs those declarations because of TS project
references. So the apps' `build` and `typecheck` targets depend on
**`^typecheck`**, not `^build`. Writing `dependsOn: ["^build"]` looks right and
silently does nothing, and the app build then fails with a wall of TS6305
"has not been built from source file" errors the first time `dist/` is absent.

## Nx targets and Next builds disagree about typecheck

`@nx/js/typescript`'s inferred `typecheck` target refuses to run when a
project reference sets `noEmit: true`, which every Next app does. Both apps
therefore declare an explicit `typecheck` target (`tsc -p tsconfig.json
--noEmit`) in their `package.json`.

## `next/font/google` needs network **at build time**

The fonts are downloaded during `next build` and self-hosted in the output, so
the running app never calls Google — but the build machine must reach
`fonts.googleapis.com` once. On an air-gapped builder or behind a strict proxy
the build fails with "Failed to fetch Geist from Google Fonts".

Either set `HTTPS_PROXY` for the build, or swap the one module that owns
typography — `apps/<app>/src/assets/fonts.ts` — to `next/font/local`:

```ts
import localFont from "next/font/local";
export const latinFont = localFont({
  src: "./geist-variable.woff2",
  variable: "--font-latin",
  display: "swap",
});
```

Nothing else imports a font, so that file is the only change needed.

## Windows: long paths break Nx and pnpm

Running `create-nx-workspace` or `nx g` from a deeply nested directory fails
with `spawnSync C:\WINDOWS\system32\cmd.exe ENOENT` — Node cannot spawn a
child process whose cwd exceeds `MAX_PATH`. Work from a short path such as
`C:\src\<project>`.

## pnpm 10 blocks install scripts by default

`pnpm-workspace.yaml` needs an explicit `allowBuilds:` list with **boolean**
values. The placeholder text `set this to true or false` that some generators
emit is a parse error that fails `pnpm install`.
