import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient, configureApiClient, resetApiClient } from "./api-client";
import { ApiClientError } from "./api-error";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

describe("apiClient", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.test");
    vi.stubGlobal("fetch", fetchMock);
    resetApiClient();
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("prefixes the base URL, sends JSON and a request id", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { id: 1 } }));
    const result = await apiClient.post<{ data: { id: number } }>("/general/v1/things", { a: 1 });

    expect(result.data.id).toBe(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.test/general/v1/things");
    expect(init?.method).toBe("POST");
    expect(init?.body).toBe(JSON.stringify({ a: 1 }));
    const headers = init?.headers as Headers;
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("x-request-id")).toBeTruthy();
  });

  it("uses the configured transport for url, token and currency", async () => {
    configureApiClient({
      resolveUrl: (p) => `/api/backend${p}`,
      getAuthToken: () => "tok",
      getCurrency: () => "irr",
    });
    fetchMock.mockResolvedValueOnce(jsonResponse({}));
    await apiClient.get("/admin/v1/me");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/backend/admin/v1/me");
    const headers = init?.headers as Headers;
    expect(headers.get("authorization")).toBe("Bearer tok");
    expect(headers.get("x-currency")).toBe("IRR");
  });

  it("normalizes HTTP errors and notifies on 401", async () => {
    const onUnauthorized = vi.fn();
    configureApiClient({ onUnauthorized });
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: "Nope", errors: { email: ["taken"] }, code: 2001 }, 401));

    const error = await apiClient.get("/x").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiClientError);
    const apiError = error as ApiClientError;
    expect(apiError.statusCode).toBe(401);
    expect(apiError.fieldError("email")).toBe("taken");
    expect(apiError.code).toBe(2001);
    expect(onUnauthorized).toHaveBeenCalledWith(apiError);
  });

  it("maps network failures to statusCode 0", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const error = (await apiClient.get("/x").catch((e: unknown) => e)) as ApiClientError;
    expect(error.isNetworkError).toBe(true);
    expect(error.message).toBe("Failed to fetch");
  });

  it("returns undefined for 204 responses", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(apiClient.delete("/x")).resolves.toBeUndefined();
  });
});
