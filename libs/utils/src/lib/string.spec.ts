import { describe, expect, it } from "vitest";
import { humanize, initials, mask, slugify, truncate } from "./string";

describe("string helpers", () => {
  it("slugifies latin and persian text", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
    expect(slugify("  سلام دنیا ")).toBe("سلام-دنیا");
  });

  it("truncates with an ellipsis", () => {
    expect(truncate("abcdefgh", 5)).toBe("abcd…");
    expect(truncate("abc", 5)).toBe("abc");
  });

  it("humanizes identifiers", () => {
    expect(humanize("someValue_here-now")).toBe("Some Value Here Now");
  });

  it("masks and abbreviates", () => {
    expect(mask("09121234567")).toBe("*******4567");
    expect(initials("Jane Q Doe")).toBe("JQ");
  });
});
