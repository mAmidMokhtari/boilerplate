import { describe, expect, it } from "vitest";
import {
  buildUrlWithQuery,
  isExternalUrl,
  joinUrl,
  objectToSearchParams,
  stripLocalePrefix,
  withLocalePrefix,
  withQuery,
} from "./url";

describe("url helpers", () => {
  it("serializes params, skipping nullish/empty and expanding arrays", () => {
    const qs = objectToSearchParams({
      page: 2,
      search: "",
      skip: null,
      none: undefined,
      ids: [1, 2],
      nested: { a: 1 },
    }).toString();
    expect(qs).toBe("page=2&ids%5B%5D=1&ids%5B%5D=2");
  });

  it("appends a query string only when non-empty", () => {
    expect(buildUrlWithQuery("/posts", "")).toBe("/posts");
    expect(buildUrlWithQuery("/posts", "page=1")).toBe("/posts?page=1");
    expect(withQuery("/posts", { page: 1 })).toBe("/posts?page=1");
  });

  it("adds and strips locale prefixes idempotently", () => {
    expect(withLocalePrefix("/about", "fa")).toBe("/fa/about");
    expect(withLocalePrefix("/fa/about", "fa")).toBe("/fa/about");
    expect(withLocalePrefix("https://x.com/a", "fa")).toBe("https://x.com/a");
    expect(stripLocalePrefix("/fa/about", ["en", "fa"])).toBe("/about");
    expect(stripLocalePrefix("/fa", ["en", "fa"])).toBe("/");
    expect(stripLocalePrefix("/about", ["en", "fa"])).toBe("/about");
  });

  it("detects external urls and joins segments", () => {
    expect(isExternalUrl("//cdn.x.com/a.png")).toBe(true);
    expect(isExternalUrl("/a")).toBe(false);
    expect(joinUrl("https://api.x.com/", "/v1/", "posts")).toBe("https://api.x.com/v1/posts");
  });
});
