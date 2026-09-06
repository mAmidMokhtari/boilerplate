import { describe, expect, it } from "vitest";
import { QueryParamBuilder } from "./query-param-builder";

describe("QueryParamBuilder", () => {
  it("is immutable and drops empty values", () => {
    const base = QueryParamBuilder.from("page=3&q=abc");
    const next = base.set("q", "").set("sort", "name").resetPage();
    expect(base.toString()).toBe("page=3&q=abc");
    expect(next.toObject()).toEqual({ sort: "name" });
  });

  it("accepts URLSearchParams and objects", () => {
    expect(QueryParamBuilder.from(new URLSearchParams({ a: "1" })).get("a")).toBe("1");
    expect(QueryParamBuilder.from({ a: "1" }).setMany({ b: 2, c: null }).toString()).toBe(
      "a=1&b=2"
    );
  });
});
