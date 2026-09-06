# Authentication

## Summary

- The backend issues a JWT **access/refresh pair**.
- Each app stores the pair in **httpOnly, SameSite=Lax cookies** named
  `<appId>_access` and `<appId>_refresh`, written only by the app's own route handlers.
- Browser JS never reads a token. Authenticated calls go through the app's
  **BFF proxy** (`/api/backend/[...path]`), which attaches the Bearer header.
- The proxy refreshes **once, single-flight**, on a 401 and rotates the cookies.
- The edge middleware guard is optimistic (cookie presence + `exp`); the API
  is the security boundary.

## Setup per app

```ts
// apps/admin/src/lib/auth.server.ts
import "server-only";
import { createAuth } from "@repo/auth/server";
import { getServerEnv, shouldUseSecureCookies } from "@repo/config";

export const auth = createAuth({
  appId: "admin",
  audience: "admin",
  backendBaseUrl: getServerEnv().INTERNAL_API_BASE_URL,
  secureCookies: shouldUseSecureCookies(),
});
```

```ts
// apps/admin/src/app/api/auth/login/route.ts
import { auth } from "@/lib/auth.server";
export const POST = auth.handlers.login;

// apps/admin/src/app/api/backend/[...path]/route.ts
import { auth } from "@/lib/auth.server";
export const { proxy: GET, proxy: POST, proxy: PUT, proxy: PATCH, proxy: DELETE } = auth;
```

```ts
// apps/admin/src/components/providers.tsx  (client)
setupBrowserApiClient({ audience: "admin" });
```

```ts
// apps/admin/src/proxy.ts  (middleware)
export default chain([
  withRequestId(),
  withSecurityHeaders({ csp: { directives: defaultCspDirectives(getPublicApiOrigin()) } }),
  withAuthGuard({
    cookieNames: createCookieNames("admin"),
    isProtected: (p) => !isAuthPage(p),
    isAuthPage,
    loginPath: "/login",
  }),
]);
```

## Sequence: login

```
browser                    app route handler                  backend
  │  POST /api/auth/login        │                                │
  │  { email, password }         │  POST /general/v1/auth/login   │
  │ ────────────────────────────►│ ──────────────────────────────►│
  │                              │ ◄──────────────────────────────│ { data: { user, access_token, refresh_token } }
  │ ◄────────────────────────────│ Set-Cookie: admin_access (httpOnly)
  │  { data: { user } }          │ Set-Cookie: admin_refresh (httpOnly)
```

## Sequence: authenticated call with expired access token

```
browser                     BFF proxy                          backend
  │ GET /api/backend/admin/v1/posts │                             │
  │ ───────────────────────────────►│ GET /admin/v1/posts (Bearer old) ─►│
  │                                 │ ◄──────────────────── 401 ─────────│
  │                                 │ POST /general/v1/auth/refresh ────►│  (single-flight per refresh token)
  │                                 │ ◄──────────── new pair ────────────│
  │                                 │ GET /admin/v1/posts (Bearer new) ─►│
  │ ◄───────────────────────────────│ ◄─────────────────── 200 ──────────│
  │ 200 + rotated Set-Cookie        │
```

If the refresh fails the proxy answers 401 and clears both cookies; the
`apiClient` dispatches `auth:unauthorized`, which the app handles with
`useUnauthorized()` (web: open login dialog; admin: `location.href = "/login"`).

## Server Components

A Server Component cannot set cookies, so it never refreshes. It reads the
access cookie and calls the backend directly:

```ts
const headers = await serverAuthHeaders(auth.cookieNames);
const me = await apiClient.get<ApiResponse<IUserModel>>(endpoints.me("admin").profile, { headers });
```

If the access token is expired, `serverAuthHeaders` returns `{}`; render the
page in its anonymous form and let the first client call refresh.

## CSRF

Cookies are `SameSite=Lax`. Additionally, every non-GET request to the auth
handlers and the proxy must have an `Origin` matching `Host` /
`X-Forwarded-Host` (`isSameOriginRequest`). Cross-site forms and fetches are
rejected with 403.

## Permissions

The backend's `me` endpoint returns a flattened `permissions: string[]`.
`useCan("admin", "posts.create")` and `<Can permission="…">` gate UI; the
backend still enforces on every request.

## Threat notes

| Threat                                 | Mitigation                                           |
| -------------------------------------- | ---------------------------------------------------- |
| XSS steals token                       | Token is httpOnly; there is nothing to steal from JS |
| CSRF on proxy                          | SameSite=Lax + Origin/Host check                     |
| Open proxy abuse                       | Proxy allow-lists the app's audience prefix only     |
| Refresh storm                          | Single-flight refresh per refresh token              |
| Stale shell after expiry               | Edge guard decodes `exp` and redirects early         |
| Secure cookies dropped on http staging | `AUTH_COOKIE_SECURE=false` override                  |
