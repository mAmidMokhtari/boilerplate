import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import type { ReactElement, ReactNode } from "react";
import { createTestQueryClient } from "./create-test-query-client";

export type RenderWithProvidersOptions = Omit<RenderOptions, "wrapper"> & {
  queryClient?: QueryClient;
  locale?: string;
  messages?: AbstractIntlMessages;
};

/**
 * `render` with the providers every component in this repo may assume:
 * TanStack Query and next-intl. Pass `messages` to test localized copy;
 * otherwise `t()` returns the key, which keeps assertions readable.
 */
export function renderWithProviders(
  ui: ReactElement,
  { queryClient = createTestQueryClient(), locale = "en", messages = {}, ...options }: RenderWithProvidersOptions = {}
): RenderResult & { queryClient: QueryClient } {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale={locale} messages={messages} onError={() => undefined} getMessageFallback={({ key }) => key}>
        {children}
      </NextIntlClientProvider>
    </QueryClientProvider>
  );

  return { ...render(ui, { wrapper: Wrapper, ...options }), queryClient };
}
