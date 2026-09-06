/**
 * Single source of truth for supported locales. Apps import this into their
 * next-intl routing; DTOs that need the list duplicate it deliberately so
 * `@repo/dtos` stays dependency-free (see `posts.dto.ts`).
 */
export const LOCALES = ["en", "fa"] as const;
export type LocaleCode = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: LocaleCode = "en";

export const RTL_LOCALES: readonly LocaleCode[] = ["fa"];

/** Native display names for language switchers. */
export const LOCALE_NAMES: Record<LocaleCode, string> = {
  en: "English",
  fa: "فارسی",
};

/** Preferred display currency per locale. A preference, never a conversion rate. */
export const LOCALE_CURRENCY: Record<LocaleCode, string> = {
  en: "USD",
  fa: "IRR",
};

export function isLocale(value: string | null | undefined): value is LocaleCode {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function isRtlLocale(locale: string): boolean {
  return (RTL_LOCALES as readonly string[]).includes(locale);
}
