# Testing

| Layer                                                   | Tool                     | Environment  | What to test                                                                                    |
| ------------------------------------------------------- | ------------------------ | ------------ | ----------------------------------------------------------------------------------------------- |
| `libs/utils`, `libs/models`, `libs/dtos`, `libs/config` | Vitest                   | node / jsdom | Pure functions, getters on partial payloads, schema accept/reject                               |
| `libs/services`                                         | Vitest                   | jsdom        | `*.api.ts` with `apiClient` mocked: URL built, model returned. `api-client` with `fetch` mocked |
| `libs/auth`, `libs/middleware`                          | Vitest                   | node         | Route handlers and middleware with real `NextRequest` objects                                   |
| `libs/ui`                                               | Vitest + Testing Library | jsdom        | Rendering, roles, keyboard paths. Stories double as visual docs                                 |
| `apps/*`                                                | Vitest                   | jsdom        | Page hooks (`useData`) with service hooks mocked; small helpers                                 |
| `apps/*-e2e`                                            | Playwright               | Chromium     | Routing, guards, forms, i18n direction                                                          |

## Commands

```bash
pnpm test                       # affected projects
pnpm nx test services           # one project
pnpm nx test ui --watch         # watch mode
pnpm nx run-many -t test        # everything
pnpm nx e2e web-e2e             # Playwright (starts the dev server)
pnpm nx e2e admin-e2e --ui
```

## Conventions

- Files sit next to the code: `thing.ts` → `thing.spec.ts`.
- One `describe` per unit, `it` names read as sentences.
- No network. Mock `apiClient` in service tests (`vi.mock("../shared/api-client")`) and `fetch` in transport tests.
- Use `@repo/testing`:
  - `renderWithProviders(ui, { locale, messages })` for anything using React Query or next-intl.
  - `createTestQueryClient()` for hook tests.
  - `fakeList(items)`, `fakeResponse(item)`, `fakeFetchResponse(body, { status })` for payloads.
- Assert behaviour, not implementation: roles and text on screen, URLs called, models returned.
- Snapshot tests are not used; they rot.

## Testing a page hook

```ts
vi.mock("@repo/services", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@repo/services")>()),
  usePostsList: () => ({ data: fakePage, isLoading: false, isError: false, refetch: vi.fn() }),
}));

const { result } = renderHook(() => useData(), { wrapper: ({ children }) => <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider> });
expect(result.current.posts).toHaveLength(2);
```

## E2E notes

- Tests run against the dev server started by the Playwright `webServer` config; set `BASE_URL` to target a deployment instead.
- Auth flows need a backend. Keep unauthenticated paths (guards, validation, i18n) in the default suite and tag backend-dependent specs with `test.describe.skip` until a staging backend is wired via `BASE_URL`.
