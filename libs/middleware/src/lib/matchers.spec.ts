import { describe, expect, it } from "vitest";
import { DEFAULT_MATCHER, startsWithAny } from "./matchers";

// Next anchors a matcher pattern to the whole pathname; an unanchored test
// would match a suffix (e.g. "/auth/login" inside "/api/auth/login").
const matches = (pathname: string) => new RegExp(`^${DEFAULT_MATCHER[0]}$`).test(pathname);

describe("DEFAULT_MATCHER", () => {
  it("runs middleware on page routes", () => {
    expect(matches("/")).toBe(true);
    expect(matches("/en/posts")).toBe(true);
  });

  it("skips API routes, Next internals and files", () => {
    for (const skipped of [
      "/api/auth/login",
      "/_next/static/chunk.js",
      "/favicon.ico",
      "/robots.txt",
      "/logo.svg",
    ]) {
      expect(matches(skipped)).toBe(false);
    }
  });
});

describe("startsWithAny", () => {
  it("matches a prefix exactly or as a path segment", () => {
    const isAccount = startsWithAny(["/account"]);
    expect(isAccount("/account")).toBe(true);
    expect(isAccount("/account/orders")).toBe(true);
    expect(isAccount("/accounts")).toBe(false);
  });
});
