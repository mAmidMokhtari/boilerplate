"use client";

import { ThemeProvider } from "next-themes";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClientProvider } from "@repo/services";
import { setupBrowserApiClient } from "@repo/auth/client";
import type { ReactNode } from "react";
import { usePreferencesStore } from "@/stores/preferences.store";
import { AuthEvents } from "./auth-events";

/**
 * Configure the browser transport once, before the first query runs. This
 * module is only ever imported from the locale layout, so it executes once.
 */
setupBrowserApiClient({
  audience: "customer",
  getCurrency: () => usePreferencesStore.getState().currency,
  getHeaders: () => ({ "Accept-Language": document.documentElement.lang || "en" }),
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider>
        <AuthEvents />
        {children}
        {process.env.NODE_ENV === "development" ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
