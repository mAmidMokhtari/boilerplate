import type { IAuthPayload, ITokenPair } from "@repo/models";

export type BackendAuthConfig = {
  /** Backend base URL as reachable from the server. */
  baseUrl: string;
  /** Backend refresh endpoint path, e.g. "/general/v1/auth/refresh". */
  refreshPath: string;
  /** Backend logout endpoint path (optional, best-effort). */
  logoutPath?: string;
};

export type BackendAuthClient = {
  url: (path: string) => string;
  /** Exchanges a refresh token for a new pair; single-flight per token. */
  refresh: (refreshToken: string) => Promise<ITokenPair | null>;
  /** Tells the backend to revoke the session. Never throws. */
  revoke: (accessToken: string | undefined) => Promise<void>;
  /** POSTs credentials to a backend auth endpoint and returns its payload or the error response. */
  authenticate: (path: string, body: unknown) => Promise<{ ok: true; payload: IAuthPayload } | { ok: false; status: number; body: unknown }>;
};

/**
 * Server-side calls to the backend's auth endpoints. Deliberately uses raw
 * `fetch`: this runs inside route handlers with tokens the browser must never
 * see, so it cannot go through the browser-configured apiClient transport.
 */
export function createBackendAuthClient(config: BackendAuthConfig): BackendAuthClient {
  const base = config.baseUrl.replace(/\/+$/, "");
  const url = (path: string) => `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const inFlight = new Map<string, Promise<ITokenPair | null>>();

  const refresh = (refreshToken: string): Promise<ITokenPair | null> => {
    const existing = inFlight.get(refreshToken);
    if (existing) return existing;

    const promise = (async () => {
      try {
        const res = await fetch(url(config.refreshPath), {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
          cache: "no-store",
        });
        if (!res.ok) return null;
        const json = (await res.json()) as { data?: Partial<ITokenPair> } & Partial<ITokenPair>;
        const pair = json.data ?? json;
        if (!pair.access_token || !pair.refresh_token) return null;
        return { access_token: pair.access_token, refresh_token: pair.refresh_token };
      } catch {
        return null;
      } finally {
        inFlight.delete(refreshToken);
      }
    })();

    inFlight.set(refreshToken, promise);
    return promise;
  };

  const revoke = async (accessToken: string | undefined): Promise<void> => {
    if (!config.logoutPath || !accessToken) return;
    try {
      await fetch(url(config.logoutPath), {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
    } catch {
      // best effort: cookies are cleared regardless
    }
  };

  const authenticate: BackendAuthClient["authenticate"] = async (path, body) => {
    const res = await fetch(url(path), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const json = (await res.json().catch(() => ({}))) as { data?: IAuthPayload };
    if (!res.ok || !json.data?.access_token) {
      return { ok: false, status: res.ok ? 502 : res.status, body: json };
    }
    return { ok: true, payload: json.data };
  };

  return { url, refresh, revoke, authenticate };
}
