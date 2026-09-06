"use client";

import type { PermissionModel } from "@repo/models";
import { useQuery } from "../shared/hooks";
import type { BaseQuery } from "../shared/types";
import { permissionsApi } from "./permissions.api";
import { permissionsKeys } from "./permissions.query-keys";

export function usePermissionsList(options: BaseQuery<PermissionModel[]> = {}) {
  return useQuery({
    queryKey: permissionsKeys.list(),
    queryFn: () => permissionsApi.getList(),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}
