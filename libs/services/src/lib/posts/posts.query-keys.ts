import type { GetPostsListInput } from "@repo/dtos";

export const POSTS_QUERY_KEY = ["posts"] as const;

export const postsKeys = {
  all: POSTS_QUERY_KEY,
  lists: () => [...POSTS_QUERY_KEY, "list"] as const,
  list: (scope: "public" | "admin", params?: GetPostsListInput) =>
    [...POSTS_QUERY_KEY, "list", scope, params ?? {}] as const,
  detail: (id: number) => [...POSTS_QUERY_KEY, "detail", id] as const,
  bySlug: (slug: string) => [...POSTS_QUERY_KEY, "slug", slug] as const,
};
