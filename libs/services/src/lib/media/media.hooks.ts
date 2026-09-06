"use client";

import type { GetMediaListDto } from "@repo/dtos";
import type { MediaModel } from "@repo/models";
import { useMutation, useQuery } from "../shared/hooks";
import type { BaseMutation, BaseQuery } from "../shared/types";
import { mediaApi, type MediaPage } from "./media.api";
import { mediaKeys } from "./media.query-keys";

export function useMediaList(params: Partial<GetMediaListDto> = {}, options: BaseQuery<MediaPage> = {}) {
  return useQuery({
    queryKey: mediaKeys.list(params),
    queryFn: () => mediaApi.getList(params),
    ...options,
  });
}

export function useUploadMedia(options?: BaseMutation<MediaModel, { file: File; alt?: string }>) {
  return useMutation({
    mutationFn: ({ file, alt }: { file: File; alt?: string }) => mediaApi.upload(file, alt),
    invalidates: [mediaKeys.lists()],
    options,
  });
}

export function useDeleteMedia(options?: BaseMutation<void, number>) {
  return useMutation({
    mutationFn: (id: number) => mediaApi.delete(id),
    invalidates: [mediaKeys.lists()],
    options,
  });
}
