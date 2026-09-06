import type { IPaginateModel } from "../paginate/paginate.interface";

/** Envelope of a paginated list: `{ data: T[], _paginate: {...} }`. */
export type IPaginatedResponseModel<T> = {
  data?: T[];
  _paginate?: IPaginateModel;
};
