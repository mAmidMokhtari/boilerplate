import { describe, expect, it } from "vitest";
import { PostStatusEnum } from "@repo/enums";
import { pickLocalized, PostModel } from "./post.model";

describe("PostModel", () => {
  it("picks localized strings with fallbacks", () => {
    expect(pickLocalized({ en: "Hi", fa: "سلام" }, "fa")).toBe("سلام");
    expect(pickLocalized({ en: "Hi" }, "fa")).toBe("Hi");
    expect(pickLocalized({ de: "Hallo" }, "fa")).toBe("Hallo");
    expect(pickLocalized(null, "fa")).toBe("");
  });

  it("exposes safe getters", () => {
    const post = new PostModel({
      id: 3,
      title: { en: "T" },
      slug: "t",
      status: PostStatusEnum.PUBLISHED,
      published_at: "2026-01-01T00:00:00Z",
    });
    expect(post.getTitle("en")).toBe("T");
    expect(post.isPublished()).toBe(true);
    expect(post.getPublishedAt()?.getUTCFullYear()).toBe(2026);
    expect(post.getCover()).toBeNull();
    expect(new PostModel().getStatus()).toBe(PostStatusEnum.DRAFT);
  });
});
