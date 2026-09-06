"use client";

import type { CreatePostDto, GetPostsListInput, UpdatePostDto } from "@repo/dtos";
import type { PostModel } from "@repo/models";
import { useMutation, useQuery } from "../shared/hooks";
import type { BaseMutation, BaseQuery } from "../shared/types";
import { postsApi, publicPostsApi, type PostsPage } from "./posts.api";
import { postsKeys } from "./posts.query-keys";

/* ---------------------------------- public --------------------------------- */

export function usePublicPostsList(
  params: GetPostsListInput = {},
  options: BaseQuery<PostsPage> = {}
) {
  return useQuery({
    queryKey: postsKeys.list("public", params),
    queryFn: () => publicPostsApi.getList(params),
    ...options,
  });
}

export function usePublicPost(slug: string, options: BaseQuery<PostModel> = {}) {
  return useQuery({
    queryKey: postsKeys.bySlug(slug),
    queryFn: () => publicPostsApi.getBySlug(slug),
    enabled: !!slug,
    ...options,
  });
}

/* ---------------------------------- admin ---------------------------------- */

export function usePostsList(params: GetPostsListInput = {}, options: BaseQuery<PostsPage> = {}) {
  return useQuery({
    queryKey: postsKeys.list("admin", params),
    queryFn: () => postsApi.getList(params),
    ...options,
  });
}

export function usePost(id: number, options: BaseQuery<PostModel> = {}) {
  return useQuery({
    queryKey: postsKeys.detail(id),
    queryFn: () => postsApi.getById(id),
    enabled: id > 0,
    ...options,
  });
}

export function useCreatePost(options?: BaseMutation<PostModel, CreatePostDto>) {
  return useMutation({
    mutationFn: (data: CreatePostDto) => postsApi.create(data),
    invalidates: [postsKeys.lists()],
    options,
  });
}

export function useUpdatePost(
  options?: BaseMutation<PostModel, { id: number; data: UpdatePostDto }>
) {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePostDto }) => postsApi.update(id, data),
    invalidates: [postsKeys.all],
    options,
  });
}

export function useDeletePost(options?: BaseMutation<void, number>) {
  return useMutation({
    mutationFn: (id: number) => postsApi.delete(id),
    invalidates: [postsKeys.lists()],
    options,
  });
}

export function usePublishPost(options?: BaseMutation<PostModel, number>) {
  return useMutation({
    mutationFn: (id: number) => postsApi.publish(id),
    invalidates: [postsKeys.all],
    options,
  });
}
