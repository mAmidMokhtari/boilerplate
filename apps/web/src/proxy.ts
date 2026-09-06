import createIntlMiddleware from "next-intl/middleware";
import { createCookieNames, DEFAULT_LOCALE, getPublicApiOrigin, LOCALES } from "@repo/config";
import {
  chain,
  defaultCspDirectives,
  fromLegacy,
  startsWithAny,
  withAuthGuard,
  withRequestId,
  withSecurityHeaders,
} from "@repo/middleware";
import { routing } from "./i18n/routing";

const isProtected = startsWithAny(["/account"]);
const isAuthPage = startsWithAny(["/login", "/register"]);

/**
 * Edge pipeline for the web app. Order matters: request id first so every
 * later response carries it, security headers wrap everything, the auth
 * guard may redirect, and next-intl runs last to resolve the locale.
 */
export default chain([
  withRequestId(),
  withSecurityHeaders({
    csp: { directives: defaultCspDirectives(getPublicApiOrigin()), enforce: false },
  }),
  withAuthGuard({
    cookieNames: createCookieNames("web"),
    locales: LOCALES,
    isProtected,
    isAuthPage,
    loginPath: (_path, locale) => `/${locale ?? DEFAULT_LOCALE}/login`,
    homePath: (locale) => `/${locale ?? DEFAULT_LOCALE}/account`,
  }),
  fromLegacy(createIntlMiddleware(routing)),
]);

/**
 * Next parses `matcher` statically at build time, so it must be a literal
 * here — importing the shared `DEFAULT_MATCHER` constant fails the build.
 * Keep this in sync with `DEFAULT_MATCHER` in `@repo/middleware`.
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.*\\.xml|.*\\..*).*)"],
};
