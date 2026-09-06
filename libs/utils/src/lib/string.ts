/** URL-safe slug from any string, including Persian/Arabic (kept as-is, spaces → "-"). */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/** Cuts a string to `max` characters and appends an ellipsis when cut. */
export function truncate(input: string, max: number, ellipsis = "…"): string {
  if (input.length <= max) return input;
  return `${input.slice(0, Math.max(0, max - ellipsis.length)).trimEnd()}${ellipsis}`;
}

export function capitalize(input: string): string {
  return input ? input[0].toUpperCase() + input.slice(1) : input;
}

/** "someValue" / "some_value" / "some-value" → "Some Value". */
export function humanize(input: string): string {
  return input
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Strips HTML tags; use only for previews, never as a sanitizer. */
export function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Masks all but the last `visible` characters ("09121234567" → "*******4567"). */
export function mask(input: string, visible = 4, char = "*"): string {
  if (input.length <= visible) return input;
  return char.repeat(input.length - visible) + input.slice(-visible);
}

/** Initials from a full name, max two letters. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Quick non-cryptographic id for client-side keys (not for persistence). */
export function uid(prefix = ""): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return prefix ? `${prefix}_${random}` : random;
}
