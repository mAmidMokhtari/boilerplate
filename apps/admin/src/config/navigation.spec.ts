import { describe, expect, it } from "vitest";
import { NAVIGATION } from "./navigation";

describe("navigation", () => {
  it("has unique hrefs", () => {
    const hrefs = NAVIGATION.flatMap((g) => g.items.map((i) => i.href));
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("every item has a label and an icon", () => {
    for (const item of NAVIGATION.flatMap((g) => g.items)) {
      expect(item.label).toBeTruthy();
      expect(item.icon).toBeTypeOf("object");
    }
  });
});
