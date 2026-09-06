/* eslint-disable no-console -- this is the one sanctioned console wrapper */

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

type LogFields = Record<string, unknown>;

let minLevel: LogLevel = process.env.NODE_ENV === "production" ? "info" : "debug";

/** Raises or lowers the threshold at runtime (tests, debugging a deployment). */
export function setLogLevel(level: LogLevel): void {
  minLevel = level;
}

function emit(level: LogLevel, scope: string, message: string, fields?: LogFields): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[minLevel]) return;
  const entry = { level, scope, message, time: new Date().toISOString(), ...fields };
  const line = typeof window === "undefined" ? JSON.stringify(entry) : `[${scope}] ${message}`;
  const sink = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  typeof window === "undefined" ? sink(line) : sink(line, fields ?? "");
}

export type Logger = {
  debug: (message: string, fields?: LogFields) => void;
  info: (message: string, fields?: LogFields) => void;
  warn: (message: string, fields?: LogFields) => void;
  error: (message: string, fields?: LogFields) => void;
  child: (scope: string) => Logger;
};

/**
 * Structured logger: JSON lines on the server (parsable by any log
 * aggregator), readable prefixes in the browser. Create one per module:
 *
 * ```ts
 * const log = createLogger("bff-proxy");
 * log.warn("refresh failed", { requestId });
 * ```
 *
 * This is the only place `console.*` is allowed to appear.
 */
export function createLogger(scope: string): Logger {
  return {
    debug: (m, f) => emit("debug", scope, m, f),
    info: (m, f) => emit("info", scope, m, f),
    warn: (m, f) => emit("warn", scope, m, f),
    error: (m, f) => emit("error", scope, m, f),
    child: (child) => createLogger(`${scope}:${child}`),
  };
}

export const logger = createLogger("app");
