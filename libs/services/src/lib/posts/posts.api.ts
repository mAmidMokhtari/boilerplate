import type { CreatePostDto, GetPostsListInput, UpdatePostDto } from "@repo/dtos";
import type { IPaginatedResponseModel, IPostModel } from "@repo/models";
import { PaginatedResponseModel, PostModel } from "@repo/models";
import { withQuery } from "@repo/utils";
import { apiClient, type RequestOptions } from "../shared/api-client";
import { endpoints } from "../shared/endpoints";
import type { ApiResponse } from "../shared/types";

export type PostsPage = PaginatedResponseModel<IPostModel, PostModel>;

/**
 * Public reads (web app). `options` lets Server Components pass Next cache
 * hints: `publicPostsApi.getList({}, { next: { revalidate: 60, tags: ["posts"] } })`.
 */
export const publicPostsApi = {
  getList: async (params: GetPostsListInput = {}, options?: RequestOptions): Promise<PostsPage> => {
    const raw = await apiClient.get<IPaginatedResponseModel<IPostModel>>(
      withQuery(endpoints.posts.public.list, params),
      options
    );
    return new PaginatedResponseModel(PostModel, raw);
  },

  getBySlug: async (slug: string, options?: RequestOptions): Promise<PostModel> => {
    const raw = await apiClient.get<ApiResponse<IPostModel>>(endpoints.posts.public.bySlug(slug), options);
    return new PostModel(raw.data);
  },
};

/** Admin CRUD (admin app). */
export const postsApi = {
  getList: async (params: GetPostsListInput = {}): Promise<PostsPage> => {
    const raw = await apiClient.get<IPaginatedResponseModel<IPostModel>>(
      withQuery(endpoints.posts.admin.list, params)
    );
    return new PaginatedResponseModel(PostModel, raw);
  },

  getById: async (id: number): Promise<PostModel> => {
    const raw = await apiClient.get<ApiResponse<IPostModel>>(endpoints.posts.admin.byId(id));
    return new PostModel(raw.data);
  },

  create: async (data: CreatePostDto): Promise<PostModel> => {
    const raw = await apiClient.post<ApiResponse<IPostModel>>(endpoints.posts.admin.create, data);
    return new PostModel(raw.data);
  },

  update: async (id: number, data: UpdatePostDto): Promise<PostModel> => {
    const raw = await apiClient.patch<ApiResponse<IPostModel>>(endpoints.posts.admin.update(id), data);
    return new PostModel(raw.data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(endpoints.posts.admin.delete(id));
  },

  publish: async (id: number): Promise<PostModel> => {
    const raw = await apiClient.post<ApiResponse<IPostModel>>(endpoints.posts.admin.publish(id));
    return new PostModel(raw.data);
  },
};
