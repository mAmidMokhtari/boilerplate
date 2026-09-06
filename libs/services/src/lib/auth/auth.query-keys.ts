import type { ApiAudience } from "@repo/config";

export const AUTH_QUERY_KEY = ["auth"] as const;

export const authKeys = {
  all: AUTH_QUERY_KEY,
  session: () => [...AUTH_QUERY_KEY, "session"] as const,
  me: (audience: Exclude<ApiAudience, "general">) => [...AUTH_QUERY_KEY, "me", audience] as const,
  permissions: (audience: Exclude<ApiAudience, "general">) =>
    [...AUTH_QUERY_KEY, "permissions", audience] as const,
};
