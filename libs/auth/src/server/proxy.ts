import { NextResponse, type NextRequest } from "next/server";
import type { AuthCookieNames } from "@repo/config";
import type { ITokenPair } from "@repo/models";
import type { BackendAuthClient } from "./backend";
import { clearAuthCookies, readAuthCookies, setAuthCookies } from "./cookies";
import { isSameOriginRequest } from "./request";

export type BackendProxyConfig = {
  backend: BackendAuthClient;
  cookies: { names: AuthCookieNames; secure: boolean; domain?: string };
  /**
   * Backend path prefixes this proxy may forward to, e.g. ["admin/v1/"].
   * Anything else is a 404 — the proxy is not a general-purpose tunnel.
   */
  allowedPrefixes: readonly string[];
  /** Request headers copied to the backend (lower-case). */
  forwardRequestHeaders?: readonly string[];
  /** Response headers copied back to the browser (lower-case). */
  forwardResponseHeaders?: readonly string[];
};

const DEFAULT_REQUEST_HEADERS = [
  "content-type",
  "accept",
  "accept-language",
  "x-currency",
  "x-request-id",
];
const DEFAULT_RESPONSE_HEADERS = ["content-type", "content-disposition", "x-request-id"];

type ProxyContext = { params: Promise<{ path: string[] }> };

/**
 * BFF proxy for authenticated API calls.
 *
 * The browser calls same-origin `/api/backend/<audience>/v1/...`; this
 * handler attaches the Bearer token from the httpOnly cookie, forwards the
 * request, and on a 401 refreshes the pair once (single-flight), rotates the
 * cookies and retries. Client JS never sees a token.
 *
 * ```ts
 * // apps/admin/src/app/api/backend/[...path]/route.ts
 * const handler = createBackendProxy({...});
 * export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
 * ```
 */
export function createBackendProxy(config: BackendProxyConfig) {
  const {
    backend,
    cookies,
    allowedPrefixes,
    forwardRequestHeaders = DEFAULT_REQUEST_HEADERS,
    forwardResponseHeaders = DEFAULT_RESPONSE_HEADERS,
  } = config;

  return async function handle(req: NextRequest, context: ProxyContext): Promise<NextResponse> {
    if (req.method !== "GET" && req.method !== "HEAD" && !isSameOriginRequest(req)) {
      return NextResponse.json({ message: "Forbidden", statusCode: 403 }, { status: 403 });
    }

    const { path } = await context.params;
    const targetPath = path.join("/");
    if (!allowedPrefixes.some((prefix) => targetPath.startsWith(prefix))) {
      return NextResponse.json({ message: "Not found", statusCode: 404 }, { status: 404 });
    }

    const targetUrl = backend.url(`/${targetPath}${req.nextUrl.search}`);

    const headers: Record<string, string> = { Accept: "application/json" };
    for (const name of forwardRequestHeaders) {
      const value = req.headers.get(name);
      if (value) headers[name] = value;
    }

    // Buffer once so the request can be replayed after a token refresh.
    const body =
      req.method === "GET" || req.method === "HEAD"
        ? undefined
        : Buffer.from(await req.arrayBuffer());

    const { access_token, refresh_token } = readAuthCookies(req, cookies.names);

    const send = (token: string | undefined) =>
      fetch(targetUrl, {
        method: req.method,
        headers: token ? { ...headers, Authorization: `Bearer ${token}` } : headers,
        body,
        cache: "no-store",
        // @ts-expect-error -- undici option needed for streaming request bodies
        duplex: "half",
      });

    let upstream = await send(access_token);
    let rotated: ITokenPair | null = null;

    if (upstream.status === 401) {
      rotated = refresh_token ? await backend.refresh(refresh_token) : null;
      if (!rotated) {
        const res = NextResponse.json(
          { message: "Unauthenticated", statusCode: 401 },
          { status: 401 }
        );
        clearAuthCookies(res, cookies);
        return res;
      }
      upstream = await send(rotated.access_token);
    }

    const responseHeaders = new Headers();
    for (const name of forwardResponseHeaders) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }

    const res = new NextResponse(upstream.status === 204 ? null : await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: responseHeaders,
    });

    if (rotated) setAuthCookies(res, rotated, cookies);
    else if (upstream.status === 401) clearAuthCookies(res, cookies);

    return res;
  };
}
