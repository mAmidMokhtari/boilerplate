import { NextResponse } from "next/server";
import type { AuthCookieNames } from "@repo/config";
import type { Middleware } from "./chain";
import { decodeJwtExp } from "./matchers";

export type AuthGuardOptions = {
  cookieNames: AuthCookieNames;
  /** Return true for paths that require a session. Receives the pathname without a locale prefix. */
  isProtected: (pathname: string) => boolean;
  /** Return true for auth pages (login, register) that a signed-in user should skip. */
  isAuthPage?: (pathname: string) => boolean;
  /** Where anonymous users go. Receives the request so you can add a locale prefix. */
  loginPath: string | ((pathname: string, locale: string | null) => string);
  /** Where signed-in users go when they hit an auth page. Default "/". */
  homePath?: string | ((locale: string | null) => string);
  /** Locales to strip before matching; also passed to the path builders. */
  locales?: readonly string[];
  /** Query param that remembers the intended destination. Default "next". */
  returnToParam?: string | false;
};

function splitLocale(pathname: string, locales: readonly string[] = []): { locale: string | null; path: string } {
  const [, first = "", ...rest] = pathname.split("/");
  if (locales.includes(first)) {
    return { locale: first, path: `/${rest.join("/")}`.replace(/\/$/, "") || "/" };
  }
  return { locale: null, path: pathname };
}

/**
 * Optimistic edge guard backed by the real httpOnly cookies. A refresh
 * cookie alone counts as "has session" because the BFF proxy mints a new
 * access token on the first API call. The API remains the security boundary.
 */
export function withAuthGuard(options: AuthGuardOptions): Middleware {
  const {
    cookieNames,
    isProtected,
    isAuthPage = () => false,
    loginPath,
    homePath = "/",
    locales = [],
    returnToParam = "next",
  } = options;

  return async (req, _event, next) => {
    const { locale, path } = splitLocale(req.nextUrl.pathname, locales);

    const access = req.cookies.get(cookieNames.access)?.value;
    const hasValidAccess = !!access && !isExpired(access);
    const hasSession = hasValidAccess || req.cookies.has(cookieNames.refresh);

    if (!hasSession && isProtected(path)) {
      const target = typeof loginPath === "function" ? loginPath(path, locale) : loginPath;
      const url = req.nextUrl.clone();
      url.pathname = target;
      url.search = "";
      if (returnToParam) url.searchParams.set(returnToParam, req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(url);
    }

    if (hasSession && isAuthPage(path)) {
      const target = typeof homePath === "function" ? homePath(locale) : homePath;
      const url = req.nextUrl.clone();
      url.pathname = target;
      url.search = "";
      return NextResponse.redirect(url);
    }

    return next();
  };
}

function isExpired(token: string): boolean {
  const exp = decodeJwtExp(token);
  return exp != null && exp * 1000 <= Date.now();
}
