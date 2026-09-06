/**
 * Backend URL namespaces by audience. Every endpoint in `@repo/services`
 * is built from one of these so an app can never accidentally call the
 * wrong audience (the BFF proxy also allow-lists by prefix).
 */
export const API_PREFIX = {
  /** Public, unauthenticated endpoints (catalog, content, settings). */
  general: "/general/v1",
  /** Authenticated end-user endpoints (profile, orders, cart). */
  customer: "/customer/v1",
  /** Authenticated staff endpoints consumed by the admin app. */
  admin: "/admin/v1",
} as const;

export type ApiAudience = keyof typeof API_PREFIX;

/** Same-origin path prefix that the BFF proxy route handler listens on. */
export const BFF_PROXY_PATH = "/api/backend";

/** Same-origin auth route handlers each app exposes. */
export const AUTH_ROUTES = {
  login: "/api/auth/login",
  register: "/api/auth/register",
  logout: "/api/auth/logout",
  session: "/api/auth/session",
} as const;

/** Header the apiClient sends so backend logs can correlate a request. */
export const REQUEST_ID_HEADER = "x-request-id";

/** Header carrying the display currency the user picked. */
export const CURRENCY_HEADER = "x-currency";
