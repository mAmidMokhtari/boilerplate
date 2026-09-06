"use client";

import {
  useQuery as useTanStackQuery,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { ApiClientError } from "../api-error";

/**
 * `useQuery` typed to `ApiClientError` so every consumer can branch on
 * `error.statusCode` without casting. Defaults come from the QueryClient.
 */
export function useQuery<TData, TKey extends QueryKey = QueryKey>(
  options: UseQueryOptions<TData, ApiClientError, TData, TKey>
): UseQueryResult<TData, ApiClientError> {
  return useTanStackQuery<TData, ApiClientError, TData, TKey>(options);
}
