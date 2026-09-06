import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { BackendAuthClient } from "./backend";
import { createBackendProxy } from "./proxy";

const names = { access: "t_access", refresh: "t_refresh" };

function makeBackend(overrides: Partial<BackendAuthClient> = {}): BackendAuthClient {
  return {
    url: (p) => `https://api.test${p}`,
    refresh: vi.fn(async () => null),
    revoke: vi.fn(async () => undefined),
    authenticate: vi.fn(),
    ...overrides,
  };
}

function request(
  path: string,
  init: { method?: string; cookies?: Record<string, string>; headers?: Record<string, string> } = {}
) {
  const req = new NextRequest(`https://app.test/api/backend/${path}`, {
    method: init.method ?? "GET",
    headers: init.headers,
  });
  for (const [k, v] of Object.entries(init.cookies ?? {})) req.cookies.set(k, v);
  return req;
}

const ctx = (path: string) => ({ params: Promise.resolve({ path: path.split("/") }) });

describe("createBackendProxy", () => {
  const fetchMock = vi.fn<typeof fetch>();
  vi.stubGlobal("fetch", fetchMock);

  afterEach(() => fetchMock.mockReset());

  it("rejects paths outside the allow-list", async () => {
    const proxy = createBackendProxy({
      backend: makeBackend(),
      cookies: { names, secure: false },
      allowedPrefixes: ["admin/v1/"],
    });
    const res = await proxy(request("customer/v1/me"), ctx("customer/v1/me"));
    expect(res.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards with the bearer from the cookie", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ data: 1 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    const proxy = createBackendProxy({
      backend: makeBackend(),
      cookies: { names, secure: false },
      allowedPrefixes: ["admin/v1/"],
    });
    const res = await proxy(
      request("admin/v1/posts?page=2", { cookies: { t_access: "abc" } }),
      ctx("admin/v1/posts")
    );

    expect(res.status).toBe(200);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.test/admin/v1/posts?page=2");
    expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer abc");
  });

  it("refreshes once on 401 and rotates cookies", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 401 })).mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    const backend = makeBackend({
      refresh: vi.fn(async () => ({ access_token: "new", refresh_token: "new-r" })),
    });
    const proxy = createBackendProxy({
      backend,
      cookies: { names, secure: false },
      allowedPrefixes: ["admin/v1/"],
    });

    const res = await proxy(
      request("admin/v1/me", { cookies: { t_access: "old", t_refresh: "r" } }),
      ctx("admin/v1/me")
    );
    expect(res.status).toBe(200);
    expect(backend.refresh).toHaveBeenCalledWith("r");
    expect((fetchMock.mock.calls[1][1]?.headers as Record<string, string>).Authorization).toBe(
      "Bearer new"
    );
    expect(res.cookies.get(names.access)?.value).toBe("new");
  });

  it("clears cookies when the refresh fails", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 401 }));
    const proxy = createBackendProxy({
      backend: makeBackend(),
      cookies: { names, secure: false },
      allowedPrefixes: ["admin/v1/"],
    });
    const res = await proxy(
      request("admin/v1/me", { cookies: { t_access: "old", t_refresh: "r" } }),
      ctx("admin/v1/me")
    );
    expect(res.status).toBe(401);
    expect(res.cookies.get(names.access)?.value).toBe("");
  });

  it("blocks cross-origin mutations", async () => {
    const proxy = createBackendProxy({
      backend: makeBackend(),
      cookies: { names, secure: false },
      allowedPrefixes: ["admin/v1/"],
    });
    const res = await proxy(
      request("admin/v1/posts", {
        method: "POST",
        headers: { origin: "https://evil.test", host: "app.test" },
      }),
      ctx("admin/v1/posts")
    );
    expect(res.status).toBe(403);
  });
});
