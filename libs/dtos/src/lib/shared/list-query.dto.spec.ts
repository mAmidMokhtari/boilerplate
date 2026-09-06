import { describe, expect, it } from "vitest";
import { listQuerySchema } from "./list-query.dto";

describe("listQuerySchema", () => {
  it("applies defaults and coerces strings from the URL", () => {
    expect(listQuerySchema.parse({})).toEqual({ page: 1, per_page: 20 });
    expect(listQuerySchema.parse({ page: "3", per_page: "50", search: " x " })).toMatchObject({
      page: 3,
      per_page: 50,
      search: "x",
    });
  });

  it("rejects out-of-range values", () => {
    expect(listQuerySchema.safeParse({ page: 0 }).success).toBe(false);
    expect(listQuerySchema.safeParse({ per_page: 1000 }).success).toBe(false);
    expect(listQuerySchema.safeParse({ sort_order: "sideways" }).success).toBe(false);
  });
});
