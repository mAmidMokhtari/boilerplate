"use client";

import { useUsersList } from "@repo/services";
import { useTableFilters } from "@repo/utils";

export function useData() {
  /* --------------------------------- State --------------------------------- */
  const table = useTableFilters();

  /* --------------------------------- APIs ---------------------------------- */
  const list = useUsersList(table.query);

  /* --------------------------------- Return -------------------------------- */
  return {
    table,
    users: list.data?.getItems() ?? [],
    paginate: list.data?.getPaginate(),
    isLoading: list.isLoading,
    isError: list.isError,
    refetch: () => void list.refetch(),
  };
}
