"use client";

import type { RoleModel } from "@repo/models";
import { useMutation, useQuery } from "../shared/hooks";
import type { BaseMutation, BaseQuery } from "../shared/types";
import { rolesApi, type RolePayload } from "./roles.api";
import { rolesKeys } from "./roles.query-keys";

export function useRolesList(options: BaseQuery<RoleModel[]> = {}) {
  return useQuery({ queryKey: rolesKeys.list(), queryFn: () => rolesApi.getList(), ...options });
}

export function useRole(id: number, options: BaseQuery<RoleModel> = {}) {
  return useQuery({
    queryKey: rolesKeys.detail(id),
    queryFn: () => rolesApi.getById(id),
    enabled: id > 0,
    ...options,
  });
}

export function useCreateRole(options?: BaseMutation<RoleModel, RolePayload>) {
  return useMutation({
    mutationFn: (data: RolePayload) => rolesApi.create(data),
    invalidates: [rolesKeys.all],
    options,
  });
}

export function useUpdateRole(
  options?: BaseMutation<RoleModel, { id: number; data: RolePayload }>
) {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RolePayload }) => rolesApi.update(id, data),
    invalidates: [rolesKeys.all],
    options,
  });
}

export function useDeleteRole(options?: BaseMutation<void, number>) {
  return useMutation({
    mutationFn: (id: number) => rolesApi.delete(id),
    invalidates: [rolesKeys.all],
    options,
  });
}

export function useSyncRolePermissions(
  options?: BaseMutation<RoleModel, { id: number; permissions: string[] }>
) {
  return useMutation({
    mutationFn: ({ id, permissions }: { id: number; permissions: string[] }) =>
      rolesApi.syncPermissions(id, permissions),
    invalidates: [rolesKeys.all],
    options,
  });
}
