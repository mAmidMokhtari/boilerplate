const ISO_4217_RE = /^[A-Za-z]{3}$/;

export type FormatMoneyOptions = {
  /** Show the currency as code ("USD") instead of symbol ("$"). */
  display?: "symbol" | "code" | "narrowSymbol" | "name";
  /** Override fraction digits; defaults to the currency's own minor unit. */
  fractionDigits?: number;
  /** Numbering system override, e.g. "arab" for Eastern Arabic digits. */
  numberingSystem?: string;
};

/** Sanitizes a currency code, falling back when it is not a 3-letter ISO code. */
export function normalizeCurrency(code: string | null | undefined, fallback = "USD"): string {
  const trimmed = code?.trim();
  return trimmed && ISO_4217_RE.test(trimmed) ? trimmed.toUpperCase() : fallback;
}

/**
 * The one money formatter. Every price in every app goes through here so
 * locale, currency and digit shaping are decided in exactly one place.
 *
 * ```ts
 * formatMoney(1250, "en", "USD")   // "$1,250.00"
 * formatMoney(1250000, "fa", "IRR") // "۱٬۲۵۰٬۰۰۰ ریال"
 * ```
 */
export function formatMoney(
  amount: number | string | null | undefined,
  locale: string,
  currency: string,
  options: FormatMoneyOptions = {}
): string {
  const value = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  if (value == null || Number.isNaN(value)) return "";

  const code = normalizeCurrency(currency);
  const tag = options.numberingSystem ? `${locale}-u-nu-${options.numberingSystem}` : locale;

  try {
    return new Intl.NumberFormat(tag, {
      style: "currency",
      currency: code,
      currencyDisplay: options.display ?? "symbol",
      ...(options.fractionDigits != null
        ? {
            minimumFractionDigits: options.fractionDigits,
            maximumFractionDigits: options.fractionDigits,
          }
        : {}),
    }).format(value);
  } catch {
    return `${value} ${code}`;
  }
}

/** Parses "1,250.50" / "۱٬۲۵۰٫۵" style input back into a number. */
export function parseMoneyInput(input: string): number | null {
  const normalized = input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[٫]/g, ".")
    .replace(/[^\d.-]/g, "");
  if (!normalized) return null;
  const value = Number.parseFloat(normalized);
  return Number.isNaN(value) ? null : value;
}
