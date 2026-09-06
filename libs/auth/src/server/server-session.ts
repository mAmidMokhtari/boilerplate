import { cookies } from "next/headers";
import type { AuthCookieNames } from "@repo/config";
import { isJwtExpired } from "./jwt";

/**
 * Reads the access token inside Server Components / route handlers so
 * server-side fetches can call the backend directly with a Bearer header:
 *
 * ```ts
 * const headers = await serverAuthHeaders(auth.cookieNames);
 * const me = await apiClient.get(endpoints.me("admin").profile, { headers });
 * ```
 *
 * Returns `{}` when there is no usable token; the caller decides whether to
 * redirect. Refreshing is not attempted here — a Server Component cannot
 * set cookies. The next client-side API call refreshes through the proxy.
 */
export async function getServerAccessToken(names: AuthCookieNames): Promise<string | null> {
  const store = await cookies();
  const token = store.get(names.access)?.value;
  if (!token || isJwtExpired(token)) return null;
  return token;
}

export async function serverAuthHeaders(names: AuthCookieNames): Promise<Record<string, string>> {
  const token = await getServerAccessToken(names);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function hasServerSession(names: AuthCookieNames): Promise<boolean> {
  const store = await cookies();
  return store.has(names.access) || store.has(names.refresh);
}
