import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getPublicEnv } from "@repo/config";

type PreferencesState = {
  /** Display currency (ISO 4217). Sent as `x-currency` on every API call. */
  currency: string;
  setCurrency: (currency: string) => void;
};

/**
 * Cross-page client preferences. Server state never lives here — that is
 * React Query's job. Persisted to localStorage; safe to read on the server
 * because the initial value is static.
 */
export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      currency: getPublicEnv().NEXT_PUBLIC_DEFAULT_CURRENCY,
      setCurrency: (currency) => set({ currency: currency.toUpperCase() }),
    }),
    { name: "web.preferences", version: 1 }
  )
);
