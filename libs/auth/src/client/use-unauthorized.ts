"use client";

import { useCustomEvent } from "@repo/utils";
import type { ApiClientError } from "@repo/services";
import { UNAUTHORIZED_EVENT } from "./setup-api-client";

/**
 * Runs `handler` whenever any API call returns 401 — open a login dialog in
 * a public app, or hard-redirect to `/login` in an admin app.
 */
export function useUnauthorized(handler: (error: ApiClientError) => void): void {
  useCustomEvent<ApiClientError>(UNAUTHORIZED_EVENT, handler);
}
