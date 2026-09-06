"use client";

import {
  QueryClient,
  QueryClientProvider as TanStackQueryClientProvider,
  isServer,
} from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { isApiClientError } from "./api-error";

/** Defaults shared by every app. Override per query when a screen needs different freshness. */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error) => {
          // 4xx/5xx will not fix themselves; only retry network failures.
          if (isApiClientError(error) && !error.isNetworkError) return false;
          return failureCount < 2;
        },
        // Bubble server errors to the nearest error.tsx; handle 4xx inline.
        throwOnError: (error) => isApiClientError(error) && error.isServerError,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * One QueryClient per browser tab, a fresh one per server request — the
 * pattern recommended for App Router so server-rendered data never leaks
 * between users.
 */
export function getQueryClient(): QueryClient {
  if (isServer) return createQueryClient();
  return (browserQueryClient ??= createQueryClient());
}

export function QueryClientProvider({ children }: { children: ReactNode }) {
  const [client] = useState(getQueryClient);
  return <TanStackQueryClientProvider client={client}>{children}</TanStackQueryClientProvider>;
}
