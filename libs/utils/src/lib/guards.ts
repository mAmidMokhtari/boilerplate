/** Narrowing filter for `array.filter(isDefined)`. */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/** Exhaustiveness check for switch statements over unions. */
export function assertNever(value: never, message = `Unhandled case: ${String(value)}`): never {
  throw new Error(message);
}

/** Throws when `condition` is falsy; narrows the type afterwards. */
export function invariant(condition: unknown, message = "Invariant violation"): asserts condition {
  if (!condition) throw new Error(message);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function isServer(): boolean {
  return !isBrowser();
}
