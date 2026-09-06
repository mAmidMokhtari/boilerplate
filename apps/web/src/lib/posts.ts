import "server-only";
import { cache } from "react";
import type { IPaginatedResponseModel, IPostModel } from "@repo/models";
import { isApiClientError, publicPostsApi } from "@repo/services";
import { postsCache } from "./cache-tags";

export type PostsListResult =
  | { status: "ok"; raw: IPaginatedResponseModel<IPostModel> }
  | { status: "unavailable" };

/**
 * Server-side fetch for the posts list. Returns the RAW payload (not a
 * model) because it is passed to a Client Component as `initialData`, and
 * class instances are not serializable across the RSC boundary. The client
 * hook rebuilds the model.
 *
 * Fails soft: a backend outage renders the page with an "unavailable" state
 * instead of crashing the build or the request.
 */
export const fetchPostsList = cache(async (page = 1, perPage = 12): Promise<PostsListResult> => {
  try {
    const list = await publicPostsApi.getList({ page, per_page: perPage }, postsCache());
    return { status: "ok", raw: list.toJSON() };
  } catch {
    return { status: "unavailable" };
  }
});

export type PostResult = { status: "ok"; raw: IPostModel } | { status: "not-found" } | { status: "unavailable" };

export const fetchPostBySlug = cache(async (slug: string): Promise<PostResult> => {
  try {
    const post = await publicPostsApi.getBySlug(slug, postsCache());
    return { status: "ok", raw: post.toJSON() as IPostModel };
  } catch (error) {
    if (isApiClientError(error) && error.isNotFound) return { status: "not-found" };
    return { status: "unavailable" };
  }
});
