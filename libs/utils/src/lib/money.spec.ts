import { describe, expect, it } from "vitest";
import { formatMoney, normalizeCurrency, parseMoneyInput } from "./money";

describe("money", () => {
  it("formats with locale and currency", () => {
    expect(formatMoney(1250, "en", "USD")).toBe("$1,250.00");
    expect(formatMoney("1250.5", "en", "EUR", { display: "code" })).toContain("EUR");
  });

  it("returns an empty string for missing amounts", () => {
    expect(formatMoney(null, "en", "USD")).toBe("");
    expect(formatMoney("abc", "en", "USD")).toBe("");
  });

  it("normalizes currency codes", () => {
    expect(normalizeCurrency("usd")).toBe("USD");
    expect(normalizeCurrency("dollar", "USD")).toBe("USD");
  });

  it("parses localized digits back to numbers", () => {
    expect(parseMoneyInput("1,250.50")).toBe(1250.5);
    expect(parseMoneyInput("۱۲۵۰")).toBe(1250);
    expect(parseMoneyInput("")).toBeNull();
  });
});
