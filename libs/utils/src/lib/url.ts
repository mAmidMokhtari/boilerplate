/** Loose input: DTO list-query types carry `unknown` for coerced fields, so accept anything and keep only primitives. */
export type QueryParams = Record<string, unknown>;

function isPrimitive(value: unknown): value is string | number | boolean {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

/**
 * Builds `URLSearchParams` from a plain object, skipping null/undefined and
 * expanding arrays as `key[]=a&key[]=b` (the Laravel convention).
 */
export function objectToSearchParams(params: QueryParams): URLSearchParams {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") continue;
    if (Array.isArray(value)) {
      for (const item of value as unknown[]) {
        if (isPrimitive(item)) searchParams.append(`${key}[]`, String(item));
      }
    } else if (isPrimitive(value)) {
      searchParams.append(key, String(value));
    }
  }
  return searchParams;
}

/** Appends a query string to a path; returns the path untouched when empty. */
export function buildUrlWithQuery(basePath: string, query: string | URLSearchParams): string {
  const queryString = typeof query === "string" ? query : query.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

/** Shorthand for `buildUrlWithQuery(path, objectToSearchParams(params))`. */
export function withQuery(basePath: string, params: QueryParams): string {
  return buildUrlWithQuery(basePath, objectToSearchParams(params));
}

/**
 * Prefixes an internal path with a locale segment, leaving absolute URLs,
 * protocol-relative URLs and already-prefixed paths alone.
 */
export function withLocalePrefix(url: string, locale: string): string {
  if (!url || !url.startsWith("/") || url.startsWith("//")) return url;
  if (url === `/${locale}` || url.startsWith(`/${locale}/`)) return url;
  return `/${locale}${url}`;
}

/** Strips a leading locale segment (`/fa/about` → `/about`). */
export function stripLocalePrefix(pathname: string, locales: readonly string[]): string {
  const [, first, ...rest] = pathname.split("/");
  if (first && locales.includes(first)) {
    return `/${rest.join("/")}`.replace(/\/$/, "") || "/";
  }
  return pathname;
}

/** True for `http(s)://` and protocol-relative URLs. */
export function isExternalUrl(url: string): boolean {
  return /^(?:[a-z]+:)?\/\//i.test(url);
}

/** Joins URL segments without producing doubled or missing slashes. */
export function joinUrl(...parts: string[]): string {
  return parts
    .filter(Boolean)
    .map((part, index) =>
      index === 0 ? part.replace(/\/+$/, "") : part.replace(/^\/+|\/+$/g, "")
    )
    .join("/");
}
