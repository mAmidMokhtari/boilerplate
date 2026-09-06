"use client";

import { useCallback, useMemo, useState } from "react";
import { SortOrderEnum } from "@repo/enums";
import { useDebouncedValue } from "./use-debounce";

export type TableFiltersState<TFilters extends Record<string, unknown>> = {
  page: number;
  perPage: number;
  search: string;
  sortBy?: string;
  sortOrder?: SortOrderEnum;
  filters: TFilters;
};

/**
 * Local state for a filterable, sortable, paginated table. Returns a
 * `query` object shaped for `listQuerySchema`, with search debounced so a
 * request is not sent on every keystroke.
 */
export function useTableFilters<TFilters extends Record<string, unknown> = Record<string, never>>(
  initial: Partial<TableFiltersState<TFilters>> = {}
) {
  const [state, setState] = useState<TableFiltersState<TFilters>>({
    page: 1,
    perPage: 20,
    search: "",
    filters: {} as TFilters,
    ...initial,
  });
  const debouncedSearch = useDebouncedValue(state.search, 350);

  const setPage = useCallback((page: number) => setState((s) => ({ ...s, page })), []);
  const setPerPage = useCallback(
    (perPage: number) => setState((s) => ({ ...s, perPage, page: 1 })),
    []
  );
  const setSearch = useCallback(
    (search: string) => setState((s) => ({ ...s, search, page: 1 })),
    []
  );
  const setSort = useCallback(
    (sortBy?: string, sortOrder?: SortOrderEnum) =>
      setState((s) => ({ ...s, sortBy, sortOrder, page: 1 })),
    []
  );

  /** Cycles a column: unsorted → ascending → descending → unsorted. */
  const toggleSort = useCallback(
    (column: string) =>
      setState((s) => {
        if (s.sortBy !== column)
          return { ...s, sortBy: column, sortOrder: SortOrderEnum.ASC, page: 1 };
        if (s.sortOrder === SortOrderEnum.ASC)
          return { ...s, sortOrder: SortOrderEnum.DESC, page: 1 };
        return { ...s, sortBy: undefined, sortOrder: undefined, page: 1 };
      }),
    []
  );
  const setFilter = useCallback(
    <K extends keyof TFilters>(key: K, value: TFilters[K]) =>
      setState((s) => ({ ...s, page: 1, filters: { ...s.filters, [key]: value } })),
    []
  );
  const reset = useCallback(
    () =>
      setState((s) => ({
        ...s,
        page: 1,
        search: "",
        sortBy: undefined,
        sortOrder: undefined,
        filters: {} as TFilters,
      })),
    []
  );

  const query = useMemo(
    () => ({
      page: state.page,
      per_page: state.perPage,
      search: debouncedSearch || undefined,
      sort_by: state.sortBy,
      sort_order: state.sortOrder,
      ...state.filters,
    }),
    [state.page, state.perPage, debouncedSearch, state.sortBy, state.sortOrder, state.filters]
  );

  return {
    state,
    query,
    setPage,
    setPerPage,
    setSearch,
    setSort,
    toggleSort,
    setFilter,
    reset,
  } as const;
}
