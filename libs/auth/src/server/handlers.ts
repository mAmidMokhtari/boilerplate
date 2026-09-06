import { NextResponse, type NextRequest } from "next/server";
import type { AuthCookieNames } from "@repo/config";
import type { ITokenPair } from "@repo/models";
import type { BackendAuthClient } from "./backend";
import { clearAuthCookies, readAuthCookies, setAuthCookies } from "./cookies";
import { isSameOriginRequest, readJsonBody } from "./request";

export type AuthHandlersConfig = {
  backend: BackendAuthClient;
  cookies: { names: AuthCookieNames; secure: boolean; domain?: string };
  /** Backend paths the login/register handlers forward to. */
  paths: { login: string; register?: string; me: string };
};

type RouteHandler = (req: NextRequest) => Promise<NextResponse>;

/**
 * Same-origin auth route handlers. Mount them in each app:
 *
 * ```ts
 * // apps/web/src/app/api/auth/login/route.ts
 * export const POST = authHandlers.login;
 * ```
 *
 * Tokens are written to httpOnly cookies and never appear in a response body.
 */
export function createAuthHandlers(config: AuthHandlersConfig) {
  const { backend, cookies, paths } = config;

  const forbidden = () =>
    NextResponse.json({ message: "Forbidden", statusCode: 403 }, { status: 403 });

  const credentialHandler =
    (backendPath: string): RouteHandler =>
    async (req) => {
      if (!isSameOriginRequest(req)) return forbidden();
      const body = await readJsonBody(req);
      if (!body) {
        return NextResponse.json(
          { message: "Invalid request body", statusCode: 400 },
          { status: 400 }
        );
      }

      const result = await backend.authenticate(backendPath, body);
      if (!result.ok)
        return NextResponse.json(result.body ?? { message: "Authentication failed" }, {
          status: result.status,
        });

      const { user, ...tokens } = result.payload;
      const res = NextResponse.json({ data: { user } });
      setAuthCookies(res, tokens, cookies);
      return res;
    };

  const login: RouteHandler = credentialHandler(paths.login);

  const register: RouteHandler = paths.register
    ? credentialHandler(paths.register)
    : async () =>
        NextResponse.json({ message: "Registration disabled", statusCode: 404 }, { status: 404 });

  const logout: RouteHandler = async (req) => {
    if (!isSameOriginRequest(req)) return forbidden();
    const { access_token } = readAuthCookies(req, cookies.names);
    await backend.revoke(access_token);
    const res = NextResponse.json({ data: { ok: true } });
    clearAuthCookies(res, cookies);
    return res;
  };

  /**
   * Session probe: resolves the current user from the cookie by calling the
   * backend `me` endpoint. Always 200 so `useSession` never throws — an empty
   * `data` means "anonymous". Refreshes once on 401 like the BFF proxy does.
   */
  const session: RouteHandler = async (req) => {
    const { access_token, refresh_token } = readAuthCookies(req, cookies.names);
    if (!access_token && !refresh_token) return NextResponse.json({ data: {} });

    const fetchMe = (token: string) =>
      fetch(backend.url(paths.me), {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

    let rotated: ITokenPair | null = null;
    let upstream = access_token ? await fetchMe(access_token) : null;

    if (!upstream || upstream.status === 401) {
      rotated = refresh_token ? await backend.refresh(refresh_token) : null;
      if (!rotated) {
        const res = NextResponse.json({ data: {} });
        clearAuthCookies(res, cookies);
        return res;
      }
      upstream = await fetchMe(rotated.access_token);
    }

    if (!upstream.ok) {
      const res = NextResponse.json({ data: {} });
      if (upstream.status === 401) clearAuthCookies(res, cookies);
      return res;
    }

    const json = (await upstream.json().catch(() => ({}))) as { data?: unknown };
    const res = NextResponse.json({ data: { user: json.data ?? null } });
    if (rotated) setAuthCookies(res, rotated, cookies);
    return res;
  };

  return { login, register, logout, session };
}
