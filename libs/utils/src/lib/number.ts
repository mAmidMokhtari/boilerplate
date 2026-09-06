/** Locale-aware integer/decimal formatting (`formatNumber(1234.5, "fa")` → "۱٬۲۳۴٫۵"). */
export function formatNumber(
  value: number | null | undefined,
  locale: string,
  options: Intl.NumberFormatOptions = {}
): string {
  if (value == null || Number.isNaN(value)) return "";
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch {
    return String(value);
  }
}

/** "12%" style percentages from a 0–1 ratio. */
export function formatPercent(ratio: number, locale: string, fractionDigits = 0): string {
  return formatNumber(ratio, locale, {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

/** Compact notation ("1.2K", "3.4M"). */
export function formatCompact(value: number, locale: string): string {
  return formatNumber(value, locale, { notation: "compact", maximumFractionDigits: 1 });
}

/** Human-readable byte size ("1.5 MB"). */
export function formatBytes(bytes: number, locale = "en", decimals = 1): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${formatNumber(value, locale, { maximumFractionDigits: decimals })} ${units[exponent]}`;
}

/** Clamps `value` into `[min, max]`. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Converts Persian/Arabic-Indic digits to ASCII digits. */
export function toAsciiDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}
