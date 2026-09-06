import { beforeEach, describe, expect, it, vi } from "vitest";
import { PostModel } from "@repo/models";

vi.mock("../shared/api-client", () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import { apiClient } from "../shared/api-client";
import { postsApi, publicPostsApi } from "./posts.api";

const mocked = vi.mocked(apiClient);

describe("postsApi", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.test");
    vi.resetAllMocks();
  });

  it("builds the list URL from params and wraps the response", async () => {
    mocked.get.mockResolvedValueOnce({ data: [{ id: 1, title: { en: "A" }, slug: "a" }], _paginate: { total: 1, per_page: 20, current_page: 1, last_page: 1 } });
    const page = await postsApi.getList({ page: 2, search: "x" });

    expect(mocked.get).toHaveBeenCalledWith("/admin/v1/posts?page=2&search=x");
    expect(page.getItems()[0]).toBeInstanceOf(PostModel);
    expect(page.getPaginate().getTotal()).toBe(1);
  });

  it("forwards request options for server-side caching on public reads", async () => {
    mocked.get.mockResolvedValueOnce({ data: { id: 1, slug: "a" } });
    const post = await publicPostsApi.getBySlug("a", { next: { revalidate: 60, tags: ["posts"] } });

    expect(mocked.get).toHaveBeenCalledWith("/general/v1/posts/a", { next: { revalidate: 60, tags: ["posts"] } });
    expect(post.getSlug()).toBe("a");
  });
});
