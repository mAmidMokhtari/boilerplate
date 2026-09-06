/**
 * Cookie names shared by the route handlers that write them and the
 * middleware that reads them. Prefixed per app via `createCookieNames` so
 * two apps on the same domain never clash.
 */
export type AuthCookieNames = {
  access: string;
  refresh: string;
};

export function createCookieNames(appId: string): AuthCookieNames {
  return {
    access: `${appId}_access`,
    refresh: `${appId}_refresh`,
  };
}

/** Fallback lifetimes when a JWT carries no `exp` claim. */
export const ACCESS_TOKEN_FALLBACK_MAX_AGE = 60 * 60 * 24; // 1 day
export const REFRESH_TOKEN_FALLBACK_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/** Cookie that stores the visitor's chosen locale (read by next-intl middleware). */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Cookie that stores the chosen display currency. */
export const CURRENCY_COOKIE = "currency";
