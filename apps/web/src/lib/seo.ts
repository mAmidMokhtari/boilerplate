import type { Metadata } from "next";
import { getPublicEnv, getServerEnv, LOCALES } from "@repo/config";

/** Site-wide robots directive; private pages pass `index: false` explicitly. */
export function robotsDirective(index = true): Metadata["robots"] {
  const allowed = getServerEnv().SITE_ROBOTS_INDEX;
  return { index: allowed && index, follow: allowed };
}

/** Absolute URL for a path, using the configured app origin. */
export function absoluteUrl(path: string): string {
  const base = getPublicEnv().NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return new URL(path, base).toString();
}

/** Canonical + hreflang alternates for a localized path (without locale prefix). */
export function localizedAlternates(locale: string, path: string): NonNullable<Metadata["alternates"]> {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return {
    canonical: absoluteUrl(`/${locale}${clean}`),
    languages: Object.fromEntries(LOCALES.map((l) => [l, absoluteUrl(`/${l}${clean}`)])),
  };
}
