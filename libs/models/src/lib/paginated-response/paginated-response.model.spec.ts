import { describe, expect, it } from "vitest";
import { BaseModel } from "../base/base.model";
import type { IBaseModel } from "../base/base.interface";
import { PaginatedResponseModel } from "./paginated-response.model";

type IThing = IBaseModel & { name: string };
class ThingModel extends BaseModel<IThing> {
  getName() {
    return this.props.name ?? "";
  }
}

describe("PaginatedResponseModel", () => {
  it("instantiates items lazily and exposes pagination", () => {
    const page = new PaginatedResponseModel(ThingModel, {
      data: [{ id: 1, name: "a", created_at: "", updated_at: "" }],
      _paginate: { total: 30, per_page: 10, current_page: 2, last_page: 3 },
    });
    expect(page.getItems()).toHaveLength(1);
    expect(page.getItems()[0]).toBeInstanceOf(ThingModel);
    expect(page.getItems()[0].getName()).toBe("a");
    expect(page.getItems()).toBe(page.getItems()); // memoized
    expect(page.getPaginate().hasNextPage()).toBe(true);
    expect(page.getPaginate().hasPrevPage()).toBe(true);
    expect(page.isEmpty()).toBe(false);
  });

  it("tolerates an empty payload", () => {
    const page = new PaginatedResponseModel(ThingModel);
    expect(page.getItems()).toEqual([]);
    expect(page.isEmpty()).toBe(true);
    expect(page.getPaginate().getLastPage()).toBe(1);
  });
});
