export type TextDirection = "ltr" | "rtl";

/** Language subtags that read right-to-left. */
export const RTL_LANGUAGES: readonly string[] = ["ar", "fa", "he", "ur", "ps", "ckb", "dv", "yi"];

/** Resolves the writing direction for a BCP-47 tag ("fa-IR" → "rtl"). */
export function getDirection(locale: string | null | undefined): TextDirection {
  const language = (locale ?? "").split(/[-_]/)[0].toLowerCase();
  return RTL_LANGUAGES.includes(language) ? "rtl" : "ltr";
}

export function isRtl(locale: string | null | undefined): boolean {
  return getDirection(locale) === "rtl";
}
