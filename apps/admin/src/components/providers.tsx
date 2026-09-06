"use client";

import { ThemeProvider } from "next-themes";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { setupBrowserApiClient } from "@repo/auth/client";
import { QueryClientProvider } from "@repo/services";
import { AuthEvents } from "./auth-events";

setupBrowserApiClient({ audience: "admin" });

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
