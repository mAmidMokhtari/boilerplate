import { z } from "zod";

/** `FOO=` in a `.env` file must behave exactly like an unset variable. */
const optionalEnv = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === "" || v === undefined ? undefined : v), schema);

/**
 * Browser-safe environment. Next.js inlines `process.env.NEXT_PUBLIC_*` only
 * when each variable is referenced literally, so every key is spelled out
 * here — do not loop over `process.env`.
 *
 * Validation runs lazily on first access so importing this module never
 * throws at build time for tooling that does not load `.env`.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.url({ error: "NEXT_PUBLIC_API_BASE_URL must be an absolute URL" }),
  NEXT_PUBLIC_APP_URL: optionalEnv(z.url().optional()),
  NEXT_PUBLIC_DEFAULT_LOCALE: optionalEnv(z.string().min(2).default("en")),
  NEXT_PUBLIC_DEFAULT_CURRENCY: optionalEnv(z.string().length(3).default("USD")),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

let cached: PublicEnv | null = null;

export function getPublicEnv(): PublicEnv {
  if (cached) return cached;
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
    NEXT_PUBLIC_DEFAULT_CURRENCY: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY,
  });
  if (!parsed.success) {
    throw new Error(`Invalid public environment:\n${z.prettifyError(parsed.error)}`);
  }
  cached = parsed.data;
  return cached;
}

/** Test helper: forget the memoized values so a new `process.env` is read. */
export function resetPublicEnv(): void {
  cached = null;
}

/** Public API origin (`https://api.example.com`), used for CSP `connect-src`. */
export function getPublicApiOrigin(): string | null {
  try {
    return new URL(getPublicEnv().NEXT_PUBLIC_API_BASE_URL).origin;
  } catch {
    return null;
  }
}
