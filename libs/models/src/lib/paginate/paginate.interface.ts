/** Pagination metadata block returned by every list endpoint as `_paginate`. */
export type IPaginateModel = {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from?: number | null;
  to?: number | null;
};
