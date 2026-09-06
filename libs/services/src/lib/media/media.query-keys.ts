import type { GetMediaListDto } from "@repo/dtos";

export const MEDIA_QUERY_KEY = ["media"] as const;

export const mediaKeys = {
  all: MEDIA_QUERY_KEY,
  lists: () => [...MEDIA_QUERY_KEY, "list"] as const,
  list: (params?: Partial<GetMediaListDto>) => [...MEDIA_QUERY_KEY, "list", params ?? {}] as const,
  detail: (id: number) => [...MEDIA_QUERY_KEY, "detail", id] as const,
};
