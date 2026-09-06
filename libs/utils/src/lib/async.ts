export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Timed out after ${ms}ms`);
    this.name = "TimeoutError";
  }
}

/** Rejects with `TimeoutError` when `promise` takes longer than `ms`. */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export type RetryOptions = {
  retries?: number;
  /** Base delay; doubles each attempt up to `maxDelayMs`. */
  delayMs?: number;
  maxDelayMs?: number;
  /** Return false to stop retrying for a given error. */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
};

/** Retries `fn` with exponential backoff. */
export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { retries = 3, delayMs = 300, maxDelayMs = 5000, shouldRetry = () => true } = options;
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      if (attempt > retries || !shouldRetry(error, attempt)) throw error;
      await sleep(Math.min(delayMs * 2 ** (attempt - 1), maxDelayMs));
    }
  }
}

/**
 * Deduplicates concurrent calls: while one call is in flight, every other
 * call with the same key receives the same promise.
 */
export function singleFlight<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  keyFn: (...args: TArgs) => string = () => "default"
): (...args: TArgs) => Promise<TResult> {
  const inFlight = new Map<string, Promise<TResult>>();
  return (...args) => {
    const key = keyFn(...args);
    const existing = inFlight.get(key);
    if (existing) return existing;
    const promise = fn(...args).finally(() => inFlight.delete(key));
    inFlight.set(key, promise);
    return promise;
  };
}

/** Tuple-style error handling: `const [error, data] = await to(promise)`. */
export async function to<T, E = Error>(promise: Promise<T>): Promise<[E, null] | [null, T]> {
  try {
    return [null, await promise];
  } catch (error) {
    return [error as E, null];
  }
}
