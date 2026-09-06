import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getServerEnv, resetServerEnv, shouldUseSecureCookies } from "./env.server";

describe("getServerEnv", () => {
  beforeEach(() => resetServerEnv());
  afterEach(() => {
    vi.unstubAllEnvs();
    resetServerEnv();
  });

  it("treats an empty value as unset, so .env.example placeholders validate", () => {
    vi.stubEnv("INTERNAL_API_BASE_URL", "https://api.test");
    vi.stubEnv("AUTH_COOKIE_SECURE", "");
    vi.stubEnv("REVALIDATE_SECRET", "");
    vi.stubEnv("SITE_ROBOTS_INDEX", "");

    const env = getServerEnv();
    expect(env.AUTH_COOKIE_SECURE).toBeUndefined();
    expect(env.REVALIDATE_SECRET).toBeUndefined();
    expect(env.SITE_ROBOTS_INDEX).toBe(true);
  });

  it("rejects a missing backend URL with a readable message", () => {
    vi.stubEnv("INTERNAL_API_BASE_URL", "");
    expect(() => getServerEnv()).toThrow(/INTERNAL_API_BASE_URL/);
  });

  it("derives secure cookies from NODE_ENV and the scheme, and honours the override", () => {
    vi.stubEnv("INTERNAL_API_BASE_URL", "http://api.test");
    vi.stubEnv("NODE_ENV", "production");
    expect(shouldUseSecureCookies()).toBe(false);

    resetServerEnv();
    vi.stubEnv("INTERNAL_API_BASE_URL", "https://api.test");
    expect(shouldUseSecureCookies()).toBe(true);

    resetServerEnv();
    vi.stubEnv("AUTH_COOKIE_SECURE", "false");
    expect(shouldUseSecureCookies()).toBe(false);
  });
});
