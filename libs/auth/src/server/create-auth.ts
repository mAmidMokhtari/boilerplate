import { API_PREFIX, createCookieNames, type ApiAudience } from "@repo/config";
import { createBackendAuthClient } from "./backend";
import { createAuthHandlers } from "./handlers";
import { createBackendProxy } from "./proxy";

export type CreateAuthOptions = {
  /** Short unique id per app; prefixes cookie names ("web" → "web_access"). */
  appId: string;
  /** Which backend audience this app's users belong to. */
  audience: Exclude<ApiAudience, "general">;
  /** Backend base URL as reachable from the server. */
  backendBaseUrl: string;
  secureCookies: boolean;
  cookieDomain?: string;
  /** Backend auth paths. Defaults match `@repo/services` endpoints. */
  paths?: Partial<{
    login: string;
    register: string;
    refresh: string;
    logout: string;
    me: string;
  }>;
};

/**
 * One call wires everything an app needs for cookie-based auth:
 *
 * ```ts
 * // apps/admin/src/lib/auth.server.ts
 * export const auth = createAuth({ appId: "admin", audience: "admin", ... });
 * ```
 *
 * Then mount `auth.handlers.*` under `/api/auth/*` and `auth.proxy` under
 * `/api/backend/[...path]`, and use `auth.cookieNames` in the middleware guard.
 */
export function createAuth(options: CreateAuthOptions) {
  const cookieNames = createCookieNames(options.appId);
  const cookies = { names: cookieNames, secure: options.secureCookies, domain: options.cookieDomain };
  const audiencePrefix = API_PREFIX[options.audience];

  const paths = {
    login: `${API_PREFIX.general}/auth/login`,
    register: `${API_PREFIX.general}/auth/register`,
    refresh: `${API_PREFIX.general}/auth/refresh`,
    logout: `${API_PREFIX.general}/auth/logout`,
    me: `${audiencePrefix}/me`,
    ...options.paths,
  };

  const backend = createBackendAuthClient({
    baseUrl: options.backendBaseUrl,
    refreshPath: paths.refresh,
    logoutPath: paths.logout,
  });

  const handlers = createAuthHandlers({
    backend,
    cookies,
    paths: { login: paths.login, register: paths.register, me: paths.me },
  });

  const proxy = createBackendProxy({
    backend,
    cookies,
    allowedPrefixes: [`${audiencePrefix.replace(/^\//, "")}/`],
  });

  return { cookieNames, cookies, backend, handlers, proxy, audience: options.audience } as const;
}

export type AuthInstance = ReturnType<typeof createAuth>;
