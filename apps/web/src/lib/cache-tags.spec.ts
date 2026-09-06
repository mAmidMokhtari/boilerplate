import { describe, expect, it } from "vitest";
import { CACHE_TAGS, isRevalidatableTag, postsCache } from "./cache-tags";

describe("cache-tags", () => {
  it("accepts only declared tags", () => {
    expect(isRevalidatableTag(CACHE_TAGS.posts)).toBe(true);
    expect(isRevalidatableTag("anything-else")).toBe(false);
  });

  it("builds Next cache options with the tag and TTL", () => {
    expect(postsCache()).toEqual({ next: { revalidate: 60, tags: ["posts"] } });
  });
});
