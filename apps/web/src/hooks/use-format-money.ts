"use client";

import { useCallback } from "react";
import { useLocale } from "next-intl";
import { formatMoney, type FormatMoneyOptions } from "@repo/utils";
import { usePreferencesStore } from "@/stores/preferences.store";

/** Money formatter bound to the active locale and the visitor's display currency. */
export function useFormatMoney() {
  const locale = useLocale();
  const currency = usePreferencesStore((s) => s.currency);
  return useCallback(
    (amount: number | string | null | undefined, override?: { currency?: string } & FormatMoneyOptions) => {
      const { currency: currencyOverride, ...options } = override ?? {};
      return formatMoney(amount, locale, currencyOverride ?? currency, options);
    },
    [locale, currency]
  );
}
