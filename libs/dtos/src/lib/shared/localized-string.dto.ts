import { z } from "zod";

/**
 * Builds a Zod schema for a `{ [locale]: string }` map where `requiredLocale`
 * must be filled and every other locale is optional.
 *
 * ```ts
 * const titleSchema = localizedStringSchema(["en", "fa"], "en", { max: 255 });
 * ```
 */
export function localizedStringSchema(
  locales: readonly string[],
  requiredLocale: string,
  options: { max?: number } = {}
) {
  const max = options.max ?? 255;
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const locale of locales) {
    shape[locale] =
      locale === requiredLocale
        ? z.string().trim().min(1, `${locale.toUpperCase()} value is required`).max(max)
        : z.string().trim().max(max).optional().or(z.literal(""));
  }
  return z.object(shape);
}

export type LocalizedStringDto = Record<string, string | undefined>;
