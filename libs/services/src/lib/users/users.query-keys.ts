import type { GetUsersListInput } from "@repo/dtos";

export const USERS_QUERY_KEY = ["users"] as const;

export const usersKeys = {
  all: USERS_QUERY_KEY,
  lists: () => [...USERS_QUERY_KEY, "list"] as const,
  list: (params?: GetUsersListInput) => [...USERS_QUERY_KEY, "list", params ?? {}] as const,
  detail: (id: number) => [...USERS_QUERY_KEY, "detail", id] as const,
};
