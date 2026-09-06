import { NextRequest, NextResponse, type NextFetchEvent } from "next/server";
import { describe, expect, it } from "vitest";
import { chain, type Middleware } from "./chain";
import { withRequestId } from "./with-request-id";
import { withSecurityHeaders } from "./with-security-headers";
import { withRedirects } from "./with-redirects";
import { withAuthGuard } from "./with-auth-guard";

const event = {} as NextFetchEvent;
const req = (path: string, cookies: Record<string, string> = {}) => {
  const request = new NextRequest(`https://app.test${path}`);
  for (const [k, v] of Object.entries(cookies)) request.cookies.set(k, v);
  return request;
};

describe("middleware chain", () => {
  it("runs middlewares in order and lets the first short-circuit", async () => {
    const calls: string[] = [];
    const a: Middleware = async (_r, _e, next) => {
      calls.push("a");
      return next();
    };
    const b: Middleware = async () => {
      calls.push("b");
      return NextResponse.json({ stop: true }, { status: 418 });
    };
    const c: Middleware = async (_r, _e, next) => {
      calls.push("c");
      return next();
    };
    const res = await chain([a, b, c])(req("/"), event);
    expect(res.status).toBe(418);
    expect(calls).toEqual(["a", "b"]);
  });

  it("adds request id and security headers", async () => {
    const res = await chain([withRequestId(), withSecurityHeaders({ hsts: false })])(
      req("/"),
      event
    );
    expect(res.headers.get("x-request-id")).toBeTruthy();
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("x-frame-options")).toBe("SAMEORIGIN");
    expect(res.headers.get("strict-transport-security")).toBeNull();
  });

  it("redirects retired paths with capture groups", async () => {
    const res = await chain([
      withRedirects([{ from: /^\/de(\/.*)?$/, to: "/nl$1", permanent: true }]),
    ])(req("/de/about"), event);
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toBe("https://app.test/nl/about");
  });

  it("guards protected paths by cookie presence and skips auth pages when signed in", async () => {
    const guard = withAuthGuard({
      cookieNames: { access: "a", refresh: "r" },
      locales: ["en", "fa"],
      isProtected: (p) => p.startsWith("/account"),
      isAuthPage: (p) => p === "/login",
      loginPath: (_p, locale) => `/${locale ?? "en"}/login`,
      homePath: (locale) => `/${locale ?? "en"}`,
    });

    const anonymous = await chain([guard])(req("/fa/account/orders"), event);
    expect(anonymous.headers.get("location")).toBe(
      "https://app.test/fa/login?next=%2Ffa%2Faccount%2Forders"
    );

    const signedIn = await chain([guard])(req("/en/login", { r: "refresh" }), event);
    expect(signedIn.headers.get("location")).toBe("https://app.test/en");

    const passThrough = await chain([guard])(req("/en/posts"), event);
    expect(passThrough.headers.get("location")).toBeNull();
  });
});
