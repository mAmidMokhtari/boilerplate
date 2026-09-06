/**
 * Storage access that never throws. `localStorage` is unavailable in SSR,
 * private windows and some embedded webviews; every helper here degrades
 * to a no-op / `null` instead of crashing the page.
 */
function getStorage(kind: "local" | "session"): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function storageGet<T>(key: string, kind: "local" | "session" = "local"): T | null {
  const storage = getStorage(kind);
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    return raw == null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

export function storageSet(key: string, value: unknown, kind: "local" | "session" = "local"): void {
  const storage = getStorage(kind);
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded or storage blocked — silently ignore
  }
}

export function storageRemove(key: string, kind: "local" | "session" = "local"): void {
  getStorage(kind)?.removeItem(key);
}
