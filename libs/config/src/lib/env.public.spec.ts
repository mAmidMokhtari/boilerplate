import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPublicApiOrigin, getPublicEnv, resetPublicEnv } from "./env.public";

describe("getPublicEnv", () => {
  beforeEach(() => resetPublicEnv());
  afterEach(() => {
    vi.unstubAllEnvs();
    resetPublicEnv();
  });

  it("throws a readable error when the API URL is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    expect(() => getPublicEnv()).toThrow(/NEXT_PUBLIC_API_BASE_URL/);
  });

  it("applies defaults for empty optional values", () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.test/");
    vi.stubEnv("NEXT_PUBLIC_DEFAULT_LOCALE", "");
    vi.stubEnv("NEXT_PUBLIC_DEFAULT_CURRENCY", "");

    const env = getPublicEnv();
    expect(env.NEXT_PUBLIC_DEFAULT_LOCALE).toBe("en");
    expect(env.NEXT_PUBLIC_DEFAULT_CURRENCY).toBe("USD");
    expect(getPublicApiOrigin()).toBe("https://api.test");
  });
});
