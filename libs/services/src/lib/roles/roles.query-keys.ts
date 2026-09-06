export const ROLES_QUERY_KEY = ["roles"] as const;

export const rolesKeys = {
  all: ROLES_QUERY_KEY,
  list: () => [...ROLES_QUERY_KEY, "list"] as const,
  detail: (id: number) => [...ROLES_QUERY_KEY, "detail", id] as const,
};
