import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, isLocale, isRtlLocale, LOCALES } from "./locales";

describe("locales", () => {
  it("includes the default locale", () => {
    expect(LOCALES).toContain(DEFAULT_LOCALE);
  });

  it("validates codes and direction", () => {
    expect(isLocale("fa")).toBe(true);
    expect(isLocale("xx")).toBe(false);
    expect(isRtlLocale("fa")).toBe(true);
    expect(isRtlLocale("en")).toBe(false);
  });
});
