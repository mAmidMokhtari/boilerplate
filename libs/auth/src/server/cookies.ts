import type { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_FALLBACK_MAX_AGE,
  REFRESH_TOKEN_FALLBACK_MAX_AGE,
  type AuthCookieNames,
} from "@repo/config";
import type { ITokenPair } from "@repo/models";
import { jwtSecondsToExpiry } from "./jwt";

export type CookieWriterOptions = {
  names: AuthCookieNames;
  secure: boolean;
  /** Cookie `domain`; leave unset for host-only cookies. */
  domain?: string;
};

/**
 * Writes the token pair as httpOnly cookies. Lifetimes follow each JWT's
 * `exp` so a cookie never outlives its token; fallbacks cover opaque tokens.
 */
export function setAuthCookies(
  res: NextResponse,
  tokens: ITokenPair,
  { names, secure, domain }: CookieWriterOptions
): void {
  const base = { httpOnly: true, secure, sameSite: "lax" as const, path: "/", domain };
  res.cookies.set(names.access, tokens.access_token, {
    ...base,
    maxAge: jwtSecondsToExpiry(tokens.access_token) ?? ACCESS_TOKEN_FALLBACK_MAX_AGE,
  });
  res.cookies.set(names.refresh, tokens.refresh_token, {
    ...base,
    maxAge: jwtSecondsToExpiry(tokens.refresh_token) ?? REFRESH_TOKEN_FALLBACK_MAX_AGE,
  });
}

export function clearAuthCookies(res: NextResponse, { names, domain }: Pick<CookieWriterOptions, "names" | "domain">): void {
  for (const name of [names.access, names.refresh]) {
    res.cookies.set(name, "", { httpOnly: true, path: "/", maxAge: 0, domain });
  }
}

export function readAuthCookies(req: NextRequest, names: AuthCookieNames): Partial<ITokenPair> {
  return {
    access_token: req.cookies.get(names.access)?.value,
    refresh_token: req.cookies.get(names.refresh)?.value,
  };
}

/** True when either cookie is present — enough for an optimistic edge guard. */
export function hasSessionCookie(req: NextRequest, names: AuthCookieNames): boolean {
  return req.cookies.has(names.access) || req.cookies.has(names.refresh);
}
