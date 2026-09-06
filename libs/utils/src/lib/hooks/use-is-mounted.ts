"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;

/** False during SSR and the first client render, true afterwards. Use to gate browser-only UI. */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
