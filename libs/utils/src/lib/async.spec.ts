import { describe, expect, it, vi } from "vitest";
import { retry, singleFlight, TimeoutError, to, withTimeout } from "./async";

describe("async helpers", () => {
  it("retries with backoff and stops when shouldRetry is false", async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error("a")).mockResolvedValueOnce("ok");
    await expect(retry(fn, { retries: 2, delayMs: 1 })).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);

    const never = vi.fn().mockRejectedValue(new Error("fatal"));
    await expect(retry(never, { retries: 3, delayMs: 1, shouldRetry: () => false })).rejects.toThrow("fatal");
    expect(never).toHaveBeenCalledTimes(1);
  });

  it("times out", async () => {
    await expect(withTimeout(new Promise(() => undefined), 5)).rejects.toBeInstanceOf(TimeoutError);
  });

  it("dedupes concurrent calls per key", async () => {
    const fn = vi.fn(async (key: string) => `${key}!`);
    const once = singleFlight(fn, (key: string) => key);
    const [a, b, c] = await Promise.all([once("x"), once("x"), once("y")]);
    expect([a, b, c]).toEqual(["x!", "x!", "y!"]);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("returns tuples from to()", async () => {
    expect(await to(Promise.resolve(1))).toEqual([null, 1]);
    const [err] = await to(Promise.reject(new Error("no")));
    expect(err?.message).toBe("no");
  });
});
