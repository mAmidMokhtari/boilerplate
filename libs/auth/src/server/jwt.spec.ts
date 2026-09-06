import { describe, expect, it } from "vitest";
import { decodeJwtPayload, isJwtExpired, jwtSecondsToExpiry } from "./jwt";

function fakeJwt(payload: Record<string, unknown>): string {
  const b64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `eyJhbGciOiJIUzI1NiJ9.${b64}.sig`;
}

describe("jwt helpers", () => {
  it("decodes payloads without verifying", () => {
    expect(decodeJwtPayload(fakeJwt({ sub: 7, exp: 10 }))).toEqual({ sub: 7, exp: 10 });
    expect(decodeJwtPayload("not-a-jwt")).toBeNull();
  });

  it("computes expiry relative to now", () => {
    const now = 1_000_000 * 1000;
    expect(jwtSecondsToExpiry(fakeJwt({ exp: 1_000_060 }), now)).toBe(60);
    expect(jwtSecondsToExpiry(fakeJwt({ exp: 999_999 }), now)).toBeNull();
    expect(jwtSecondsToExpiry(fakeJwt({}), now)).toBeNull();
  });

  it("fails open when exp is missing and closed when it is past", () => {
    const now = 5_000 * 1000;
    expect(isJwtExpired(fakeJwt({}), now)).toBe(false);
    expect(isJwtExpired(fakeJwt({ exp: 4_000 }), now)).toBe(true);
    expect(isJwtExpired(fakeJwt({ exp: 6_000 }), now)).toBe(false);
  });
});
