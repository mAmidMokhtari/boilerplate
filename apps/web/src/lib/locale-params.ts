import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { LocaleCode } from "@repo/config";
import { routing } from "@/i18n/routing";

export type LocaleParams = Promise<{ locale: string } & Record<string, string | string[]>>;

/**
 * Awaits the route params, validates the locale (404 otherwise) and enables
 * static rendering for the request. Call it first in every page/layout.
 */
export async function resolveLocaleParams<T extends { locale: string }>(
  params: Promise<T>
): Promise<Omit<T, "locale"> & { locale: LocaleCode }> {
  const resolved = await params;
  if (!hasLocale(routing.locales, resolved.locale)) notFound();
  setRequestLocale(resolved.locale);
  return { ...resolved, locale: resolved.locale };
}
