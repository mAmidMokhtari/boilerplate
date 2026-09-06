import { API_PREFIX, BFF_PROXY_PATH, type ApiAudience } from "@repo/config";
import { configureApiClient, endpoints, type ApiClientError } from "@repo/services";

export const UNAUTHORIZED_EVENT = "auth:unauthorized";

export type SetupApiClientOptions = {
  /** Audience whose endpoints must go through the BFF proxy. */
  audience: Exclude<ApiAudience, "general">;
  /** Display currency provider (e.g. from a Zustand store). */
  getCurrency?: () => string | null;
  /** Extra headers such as `Accept-Language`. */
  getHeaders?: () => Record<string, string>;
  /** Override the default `window` event dispatch on 401. */
  onUnauthorized?: (error: ApiClientError) => void;
};

/**
 * Browser-side transport: same-origin `/api/*` routes stay same-origin,
 * the authenticated audience is routed through the BFF proxy, and public
 * `/general/*` endpoints go straight to the backend. No token ever passes
 * through here — cookies carry auth.
 *
 * Import this module once from the app's root client provider.
 */
export function setupBrowserApiClient(options: SetupApiClientOptions): void {
  if (typeof window === "undefined") return;

  const audiencePrefix = API_PREFIX[options.audience];

  configureApiClient({
    resolveUrl: (path) => {
      if (path.startsWith("/api/")) return path;
      if (path.startsWith(`${audiencePrefix}/`)) return `${BFF_PROXY_PATH}${path}`;
      return `${endpoints.base}${path}`;
    },
    getAuthToken: () => null,
    getCurrency: options.getCurrency,
    getHeaders: options.getHeaders,
    onUnauthorized:
      options.onUnauthorized ??
      ((error) => window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT, { detail: error }))),
  });
}
