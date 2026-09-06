import type { NextRequest } from "next/server";

/**
 * CSRF belt-and-braces for non-GET requests. Cookies are `SameSite=Lax`,
 * so cross-site POSTs already lack them; this rejects any request whose
 * `Origin` does not match the host the client actually connected to.
 *
 * A missing `Origin` means same-origin navigation or a non-browser client,
 * neither of which can carry a victim's cookies.
 */
export function isSameOriginRequest(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;

  const candidates = [req.headers.get("x-forwarded-host"), req.headers.get("host")]
    .filter((h): h is string => !!h)
    .flatMap((h) => h.split(",").map((s) => s.trim()));

  try {
    const originHost = new URL(origin).host;
    return candidates.includes(originHost);
  } catch {
    return false;
  }
}

/** Reads a JSON body, returning null on any parse failure instead of throwing. */
export async function readJsonBody<T = unknown>(req: NextRequest): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}
