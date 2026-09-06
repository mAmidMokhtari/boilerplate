export const PERMISSIONS_QUERY_KEY = ["permissions"] as const;

export const permissionsKeys = {
  all: PERMISSIONS_QUERY_KEY,
  list: () => [...PERMISSIONS_QUERY_KEY, "list"] as const,
};
