import { afterEach, describe, expect, it, vi } from "vitest";
import { createLogger, setLogLevel } from "./logger";

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setLogLevel("debug");
  });

  it("respects the minimum level", () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    setLogLevel("warn");
    createLogger("t").info("hidden");
    expect(log).not.toHaveBeenCalled();
  });

  it("routes errors to console.error with scope", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    createLogger("api").child("proxy").error("boom", { id: 1 });
    expect(error).toHaveBeenCalledTimes(1);
    expect(String(error.mock.calls[0][0])).toContain("api:proxy");
  });
});
