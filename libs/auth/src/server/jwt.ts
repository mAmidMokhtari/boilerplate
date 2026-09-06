/**
 * Minimal JWT payload reader. This only *decodes* — it never verifies a
 * signature. The API is the security boundary; the edge guard uses `exp`
 * purely to avoid rendering a shell that the first API call would reject.
 */
export type JwtPayload = {
  exp?: number;
  iat?: number;
  sub?: string | number;
  [claim: string]: unknown;
};

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf-8");
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** Seconds until the token expires, or null when unknown / already expired. */
export function jwtSecondsToExpiry(token: string, now: number = Date.now()): number | null {
  const exp = decodeJwtPayload(token)?.exp;
  if (typeof exp !== "number") return null;
  const seconds = exp - Math.floor(now / 1000);
  return seconds > 0 ? seconds : null;
}

/** True only when an `exp` claim exists and is in the past; unknown tokens fail open. */
export function isJwtExpired(token: string, now: number = Date.now()): boolean {
  const exp = decodeJwtPayload(token)?.exp;
  return typeof exp === "number" && exp * 1000 <= now;
}
