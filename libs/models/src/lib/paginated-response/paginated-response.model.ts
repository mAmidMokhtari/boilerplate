import { PaginateModel } from "../paginate/paginate.model";
import type { IPaginatedResponseModel } from "./paginated-response.interface";

type ItemConstructor<TRaw, TModel> = new (data?: Partial<TRaw>) => TModel;

/**
 * Wraps a paginated list and lazily instantiates each item as a model.
 *
 * ```ts
 * const raw = await apiClient.get<IPaginatedResponseModel<IPostModel>>(url);
 * return new PaginatedResponseModel(PostModel, raw);
 * ```
 */
export class PaginatedResponseModel<TRaw, TModel> {
  protected props: IPaginatedResponseModel<TRaw>;
  private readonly itemConstructor: ItemConstructor<TRaw, TModel>;
  private items?: TModel[];

  constructor(
    itemConstructor: ItemConstructor<TRaw, TModel>,
    data?: IPaginatedResponseModel<TRaw>
  ) {
    this.itemConstructor = itemConstructor;
    this.props = data ?? {};
  }

  getItems(): TModel[] {
    if (!this.items) {
      this.items = (this.props.data ?? []).map(
        (item) => new this.itemConstructor(item)
      );
    }
    return this.items;
  }

  getPaginate(): PaginateModel {
    return new PaginateModel(this.props._paginate);
  }

  isEmpty(): boolean {
    return this.getItems().length === 0;
  }

  /** Raw envelope, for passing across the RSC boundary (class instances are not serializable). */
  toJSON(): IPaginatedResponseModel<TRaw> {
    return this.props;
  }
}
