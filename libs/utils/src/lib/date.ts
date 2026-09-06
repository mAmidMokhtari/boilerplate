type DateInput = Date | string | number | null | undefined;

function toDate(input: DateInput): Date | null {
  if (input == null || input === "") return null;
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

export type FormatDateOptions = Intl.DateTimeFormatOptions & {
  /** "persian" renders Jalali dates for fa locales without a library. */
  calendar?: "gregory" | "persian" | "islamic";
};

/**
 * Locale-aware date formatting via `Intl`. Pass `calendar: "persian"` for
 * Jalali output (`formatDate(d, "fa", { calendar: "persian" })` → "۱۴۰۵/۶/۱۵").
 */
export function formatDate(
  input: DateInput,
  locale: string,
  options: FormatDateOptions = {}
): string {
  const date = toDate(input);
  if (!date) return "";
  const { calendar, ...rest } = options;
  const tag = calendar ? `${locale}-u-ca-${calendar}` : locale;
  try {
    return new Intl.DateTimeFormat(tag, {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...rest,
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

/** Date + time in one string. */
export function formatDateTime(
  input: DateInput,
  locale: string,
  options: FormatDateOptions = {}
): string {
  return formatDate(input, locale, { hour: "2-digit", minute: "2-digit", ...options });
}

/** "3 hours ago" / "in 2 days" using `Intl.RelativeTimeFormat`. */
export function formatRelative(input: DateInput, locale: string, now: Date = new Date()): string {
  const date = toDate(input);
  if (!date) return "";
  const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["week", 604_800],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
    ["second", 1],
  ];
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const [unit, seconds] of units) {
    if (Math.abs(diffSeconds) >= seconds || unit === "second") {
      return rtf.format(Math.round(diffSeconds / seconds), unit);
    }
  }
  return "";
}

/** ISO date without time, for `<input type="date">` values. */
export function toIsoDate(input: DateInput): string {
  const date = toDate(input);
  return date ? date.toISOString().slice(0, 10) : "";
}

export function isPast(input: DateInput, now: Date = new Date()): boolean {
  const date = toDate(input);
  return !!date && date.getTime() < now.getTime();
}

export function addDays(input: DateInput, days: number): Date | null {
  const date = toDate(input);
  if (!date) return null;
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}
