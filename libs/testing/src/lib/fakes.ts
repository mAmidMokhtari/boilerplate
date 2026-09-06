import type { IPaginateModel } from "@repo/models";

/** Builds a `_paginate` block for fake list responses. */
export function fakePaginate(overrides: Partial<IPaginateModel> = {}): IPaginateModel {
  return { total: 1, per_page: 20, current_page: 1, last_page: 1, from: 1, to: 1, ...overrides };
}

/** Wraps items in the backend's list envelope. */
export function fakeList<T>(data: T[], paginate: Partial<IPaginateModel> = {}) {
  return { data, _paginate: fakePaginate({ total: data.length, to: data.length, ...paginate }) };
}

/** Wraps a single resource in the backend's `{ data }` envelope. */
export function fakeResponse<T>(data: T) {
  return { data };
}

/** Minimal `Response`-like object for mocking `fetch`. */
export function fakeFetchResponse(body: unknown, init: { status?: number; headers?: Record<string, string> } = {}): Response {
  const status = init.status ?? 200;
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...init.headers },
  });
}
