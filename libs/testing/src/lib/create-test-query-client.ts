import { QueryClient } from "@tanstack/react-query";

/** QueryClient tuned for tests: no retries, no GC delay, errors surface immediately. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
        throwOnError: false,
      },
      mutations: { retry: false },
    },
  });
}
