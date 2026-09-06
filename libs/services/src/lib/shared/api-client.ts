import { CURRENCY_HEADER, REQUEST_ID_HEADER } from "@repo/config";
import { ApiClientError, type ApiErrorBody } from "./api-error";
import { endpoints } from "./endpoints";

/**
 * How the apiClient reaches the network. Each app configures this once at
 * startup (see `@repo/auth/client`): the browser routes authenticated
 * audiences through its same-origin BFF proxy, while server code calls the
 * backend directly with an explicit bearer token.
 */
export type ApiClientTransport = {
  /** Map an endpoint path ("/customer/v1/me") to the URL to fetch. */
  resolveUrl?: (path: string) => string;
  /** Bearer token to attach, or null for none (browser: always null — cookies carry auth). */
  getAuthToken?: () => string | null | Promise<string | null>;
  /** Display currency to send as `x-currency`, or null. */
  getCurrency?: () => string | null;
  /** Called on 401 so the app can reset client auth state / open a login dialog. */
  onUnauthorized?: (error: ApiClientError) => void;
  /** Extra headers on every request (e.g. Accept-Language). */
  getHeaders?: () => Record<string, string>;
};

export type RequestOptions = Omit<RequestInit, "body" | "method"> & {
  /** Next.js Data Cache options for server-side fetches (`{ revalidate, tags }`). */
  next?: { revalidate?: number | false; tags?: string[] };
  /** Per-request timeout; the request is aborted and rejects with statusCode 0. */
  timeoutMs?: number;
};

let transport: ApiClientTransport = {};

export function configureApiClient(next: ApiClientTransport): void {
  transport = { ...transport, ...next };
}

/** Test/utility hook: reset transport to defaults. */
export function resetApiClient(): void {
  transport = {};
}

const DEFAULT_TIMEOUT_MS = 30_000;

function makeRequestId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

async function parseErrorBody(response: Response): Promise<ApiErrorBody> {
  try {
    const body = (await response.json()) as Partial<ApiErrorBody>;
    return {
      message: body.message ?? response.statusText ?? "Request failed",
      statusCode: body.statusCode ?? response.status,
      errors: body.errors,
      code: body.code,
    };
  } catch {
    return { message: response.statusText || "Request failed", statusCode: response.status };
  }
}

class ApiClient {
  private resolveUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) return path;
    return transport.resolveUrl ? transport.resolveUrl(path) : `${endpoints.base}${path}`;
  }

  private async buildHeaders(extra?: HeadersInit, json = true): Promise<Headers> {
    const headers = new Headers(extra);
    if (json && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    if (!headers.has("Accept")) headers.set("Accept", "application/json");
    headers.set(REQUEST_ID_HEADER, makeRequestId());

    for (const [key, value] of Object.entries(transport.getHeaders?.() ?? {})) {
      headers.set(key, value);
    }
    const token = await transport.getAuthToken?.();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const currency = transport.getCurrency?.();
    if (currency) headers.set(CURRENCY_HEADER, currency.toUpperCase());
    return headers;
  }

  private async send<T>(
    path: string,
    init: RequestInit & { timeoutMs?: number },
    parse: (response: Response) => Promise<T>
  ): Promise<T> {
    const { timeoutMs = DEFAULT_TIMEOUT_MS, ...requestInit } = init;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const signal = requestInit.signal
      ? AbortSignal.any([requestInit.signal, controller.signal])
      : controller.signal;
    const requestId = (requestInit.headers as Headers | undefined)?.get(REQUEST_ID_HEADER) ?? undefined;

    try {
      const response = await fetch(this.resolveUrl(path), {
        credentials: "include",
        ...requestInit,
        signal,
      });

      if (!response.ok) {
        const body = await parseErrorBody(response);
        const error = new ApiClientError(body.message, body.statusCode ?? response.status, {
          errors: body.errors,
          code: body.code,
          requestId,
        });
        if (error.isUnauthorized) transport.onUnauthorized?.(error);
        throw error;
      }

      return await parse(response);
    } catch (error) {
      if (error instanceof ApiClientError) throw error;
      const message =
        error instanceof Error && error.name === "AbortError"
          ? `Request timed out after ${timeoutMs}ms`
          : error instanceof Error
            ? error.message
            : "Network error";
      throw new ApiClientError(message, 0, { requestId });
    } finally {
      clearTimeout(timer);
    }
  }

  private async parseJson<T>(response: Response): Promise<T> {
    if (response.status === 204) return undefined as T;
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  async get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.send<T>(
      path,
      { ...options, method: "GET", headers: await this.buildHeaders(options.headers) },
      (r) => this.parseJson<T>(r)
    );
  }

  async post<T>(path: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.send<T>(
      path,
      {
        ...options,
        method: "POST",
        headers: await this.buildHeaders(options.headers),
        body: data === undefined ? undefined : JSON.stringify(data),
      },
      (r) => this.parseJson<T>(r)
    );
  }

  async put<T>(path: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.send<T>(
      path,
      {
        ...options,
        method: "PUT",
        headers: await this.buildHeaders(options.headers),
        body: data === undefined ? undefined : JSON.stringify(data),
      },
      (r) => this.parseJson<T>(r)
    );
  }

  async patch<T>(path: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.send<T>(
      path,
      {
        ...options,
        method: "PATCH",
        headers: await this.buildHeaders(options.headers),
        body: data === undefined ? undefined : JSON.stringify(data),
      },
      (r) => this.parseJson<T>(r)
    );
  }

  async delete<T = void>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.send<T>(
      path,
      { ...options, method: "DELETE", headers: await this.buildHeaders(options.headers) },
      (r) => this.parseJson<T>(r)
    );
  }

  /** Multipart upload; never sets Content-Type so the browser adds the boundary. */
  async upload<T>(path: string, formData: FormData, options: RequestOptions = {}): Promise<T> {
    return this.send<T>(
      path,
      {
        ...options,
        method: "POST",
        headers: await this.buildHeaders(options.headers, false),
        body: formData,
        timeoutMs: options.timeoutMs ?? 120_000,
      },
      (r) => this.parseJson<T>(r)
    );
  }

  /** Binary download (exports, invoices) as a Blob. */
  async getBlob(path: string, options: RequestOptions = {}): Promise<Blob> {
    return this.send<Blob>(
      path,
      { ...options, method: "GET", headers: await this.buildHeaders(options.headers, false) },
      (r) => r.blob()
    );
  }
}

/** The one HTTP client. Only `*.api.ts` files may import it. */
export const apiClient = new ApiClient();
