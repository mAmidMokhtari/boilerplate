import { describe, expect, it } from "vitest";
import { createPostSchema } from "./posts.dto";

describe("createPostSchema", () => {
  it("requires an English title and a valid slug", () => {
    const ok = createPostSchema.safeParse({ title: { en: "Hello", fa: "" }, slug: "hello-world" });
    expect(ok.success).toBe(true);
    if (ok.success) expect(ok.data.status).toBe("draft");

    expect(createPostSchema.safeParse({ title: { en: "", fa: "x" }, slug: "a" }).success).toBe(false);
    expect(createPostSchema.safeParse({ title: { en: "A" }, slug: "Bad Slug" }).success).toBe(false);
  });
});
