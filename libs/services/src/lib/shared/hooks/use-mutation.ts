"use client";

import {
  useMutation as useTanStackMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationResult,
} from "@tanstack/react-query";
import type { ApiClientError } from "../api-error";
import type { BaseMutation } from "../types";

export type DomainMutationConfig<TData, TVariables> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Query keys to invalidate after success. The hook owns this, not the caller. */
  invalidates?: readonly QueryKey[];
  /** Caller-supplied UI side effects (toast, navigate, close drawer). */
  options?: BaseMutation<TData, TVariables>;
};

/**
 * Standard mutation wrapper: runs `mutationFn`, invalidates the listed keys,
 * then forwards to the caller's callbacks. Keeps every domain hook to three
 * lines and guarantees cache invalidation is never forgotten.
 */
export function useMutation<TData, TVariables = void>({
  mutationFn,
  invalidates = [],
  options,
}: DomainMutationConfig<TData, TVariables>): UseMutationResult<TData, ApiClientError, TVariables> {
  const queryClient = useQueryClient();

  return useTanStackMutation<TData, ApiClientError, TVariables>({
    mutationFn,
    onSuccess: async (data, variables) => {
      await Promise.all(invalidates.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => options?.onError?.(error, variables),
    onSettled: () => options?.onSettled?.(),
  });
}
