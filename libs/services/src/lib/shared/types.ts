import type { ApiClientError } from "./api-error";

/** Single-resource envelope `{ data: T }`. */
export type ApiResponse<T> = {
  data: T;
  message?: string;
};

/**
 * Options an app may pass to a mutation hook. Cache invalidation is the
 * hook's job; toasts, navigation and dialogs belong to the caller and are
 * expressed through these callbacks.
 */
export type BaseMutation<TData = unknown, TVariables = unknown> = {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: ApiClientError, variables: TVariables) => void;
  onSettled?: () => void;
};

/** Options an app may pass to a query hook. */
export type BaseQuery<TData = unknown> = {
  enabled?: boolean;
  /** Seed the cache (e.g. from a server component) so the first render is instant. */
  initialData?: TData;
  staleTime?: number;
  refetchInterval?: number | false;
};
