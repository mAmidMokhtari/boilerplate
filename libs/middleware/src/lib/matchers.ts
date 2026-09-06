/**
 * Small path helpers for guard predicates. Kept dependency-free so they run
 * in the Edge runtime.
 */

/** Builds `(pathname) => boolean` from a list of path prefixes. */
export function startsWithAny(prefixes: readonly string[]): (pathname: string) => boolean {
  return (pathname) => prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Reference `matcher` every app should use: skips static assets, images and
 * API routes.
 *
 * ⚠️ Next parses `export const config = { matcher }` **statically** at build
 * time, so an app cannot import this constant — it must repeat the literal in
 * its own `proxy.ts`. This export exists so the canonical value has one home
 * and can be asserted in tests.
 */
export const DEFAULT_MATCHER = [
  "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.*\\.xml|.*\\..*).*)",
];

/** Decodes the `exp` claim of a JWT without verifying it (Edge-safe). */
export function decodeJwtExp(token: string): number | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4))) as {
      exp?: unknown;
    };
    return typeof json.exp === "number" ? json.exp : null;
  } catch {
    return null;
  }
}
