# Bringing up a new app

```bash
pnpm nx g @nx/next:app apps/portal --style=css --appDir --src --e2eTestRunner=playwright --unitTestRunner=vitest
```

Then, in order:

1. **Tags** — in `apps/portal/package.json` set `"nx": { "tags": ["type:app", "scope:portal"] }`.
2. **Dependencies** — add the libs you use to `apps/portal/package.json` as `"workspace:*"` and run `pnpm install`.
3. **Styles** — replace `src/app/global.css` with `@import "@repo/ui/styles.css";` plus app tokens.
4. **Providers** — copy `apps/admin/src/components/providers.tsx`; set `setupBrowserApiClient({ audience })`.
5. **Auth** — copy `src/lib/auth.server.ts`, `src/app/api/auth/*`, `src/app/api/backend/[...path]`. Choose a unique `appId`.
6. **Middleware** — copy `src/proxy.ts`; compose only what the app needs.
7. **i18n** — if localized, copy `apps/web/src/i18n/*`, `messages/`, the `[locale]` layout and the `withNextIntl` block from `apps/web/next.config.js`.
8. **Env** — extend `.env.example` if the app needs new variables; add them to `@repo/config` schemas.
9. **Boundaries** — add a `scope:portal` rule in `eslint.config.mjs` if the app should not import another app's scope.
10. **CI** — add `build:portal` script in root `package.json`; add a build/deploy job in `.ci/build.yml` and `.ci/deploy.yml`; extend the GitHub matrix.
11. **Docker** — nothing to do: `docker build --build-arg APP_NAME=portal .`.
12. **Docs** — create `apps/portal/AGENTS.md` and `CLAUDE.md` (`@AGENTS.md`).
13. `pnpm check:all`.
