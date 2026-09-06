import { z } from "zod";

/**
 * An unset variable and one written as `FOO=` in a `.env` file must behave
 * identically. Without this, every optional variable in `.env.example` would
 * fail validation on a fresh clone.
 */
const optionalEnv = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === "" || v === undefined ? undefined : v), schema);

/**
 * Server-only environment. Never import this from a Client Component — the
 * `server-only` guard in the app layer makes that a build error, and none
 * of these values may carry the `NEXT_PUBLIC_` prefix.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  /** Backend base URL as reached from the server (may be an internal hostname). */
  INTERNAL_API_BASE_URL: z.url({ error: "INTERNAL_API_BASE_URL must be an absolute URL" }),
  /** Force `Secure` cookies on/off; unset = derive from NODE_ENV + https. */
  AUTH_COOKIE_SECURE: optionalEnv(
    z
      .enum(["true", "false"])
      .optional()
      .transform((v) => (v == null ? undefined : v === "true"))
  ),
  /** Shared secret for `POST /api/revalidate`. Endpoint is disabled when unset. */
  REVALIDATE_SECRET: optionalEnv(
    z.string().min(16, "REVALIDATE_SECRET must be at least 16 characters").optional()
  ),
  /** "false" on staging/preview keeps the deployment out of search engines. */
  SITE_ROBOTS_INDEX: optionalEnv(
    z
      .enum(["true", "false"])
      .default("true")
      .transform((v) => v === "true")
  ),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid server environment:\n${z.prettifyError(parsed.error)}`);
  }
  cached = parsed.data;
  return cached;
}

/** Test helper: forget the memoized values so a new `process.env` is read. */
export function resetServerEnv(): void {
  cached = null;
}

/** Whether `Secure` should be set on auth cookies for this deployment. */
export function shouldUseSecureCookies(): boolean {
  const env = getServerEnv();
  if (env.AUTH_COOKIE_SECURE !== undefined) return env.AUTH_COOKIE_SECURE;
  return env.NODE_ENV === "production" && env.INTERNAL_API_BASE_URL.startsWith("https");
}
