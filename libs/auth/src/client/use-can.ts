"use client";

import type { ApiAudience } from "@repo/config";
import { useMe } from "@repo/services";

export type UseCanResult = {
  can: boolean;
  isLoading: boolean;
};

/**
 * Whether the current user holds `permission` (direct or via a role), based
 * on the flattened `permissions` array the `me` endpoint returns.
 */
export function useCan(
  audience: Exclude<ApiAudience, "general">,
  permission: string | string[]
): UseCanResult {
  const { data: me, isLoading } = useMe(audience);
  const required = Array.isArray(permission) ? permission : [permission];
  const can = !!me && required.every((p) => me.can(p));
  return { can, isLoading };
}
