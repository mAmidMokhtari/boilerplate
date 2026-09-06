import { createCookieNames, getPublicApiOrigin } from "@repo/config";
import {
  chain,
  defaultCspDirectives,
  startsWithAny,
  withAuthGuard,
  withRequestId,
  withSecurityHeaders,
} from "@repo/middleware";
import { AUTH_PAGES, ROUTES } from "./lib/routes";

const isAuthPage = startsWithAny(AUTH_PAGES);

/** Everything in the admin app requires a session except the auth pages. */
export default chain([
  withRequestId(),
  withSecurityHeaders({
    frameOptions: "DENY",
    csp: { directives: defaultCspDirectives(getPublicApiOrigin()), enforce: false },
  }),
  withAuthGuard({
    cookieNames: createCookieNames("admin"),
    isProtected: (path) => !isAuthPage(path),
    isAuthPage,
    loginPath: ROUTES.login,
    homePath: ROUTES.home,
  }),
]);

/**
 * Next parses `matcher` statically at build time, so it must be a literal
 * here — importing the shared `DEFAULT_MATCHER` constant fails the build.
 * Keep this in sync with `DEFAULT_MATCHER` in `@repo/middleware`.
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.*\\.xml|.*\\..*).*)"],
};
