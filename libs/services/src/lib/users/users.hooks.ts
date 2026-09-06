"use client";

import type { CreateUserDto, GetUsersListInput, UpdateUserDto } from "@repo/dtos";
import type { UserModel } from "@repo/models";
import { useMutation, useQuery } from "../shared/hooks";
import type { BaseMutation, BaseQuery } from "../shared/types";
import { usersApi, type UsersPage } from "./users.api";
import { usersKeys } from "./users.query-keys";

export function useUsersList(params: GetUsersListInput = {}, options: BaseQuery<UsersPage> = {}) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => usersApi.getList(params),
    ...options,
  });
}

export function useUser(id: number, options: BaseQuery<UserModel> = {}) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: id > 0,
    ...options,
  });
}

export function useCreateUser(options?: BaseMutation<UserModel, CreateUserDto>) {
  return useMutation({
    mutationFn: (data: CreateUserDto) => usersApi.create(data),
    invalidates: [usersKeys.lists()],
    options,
  });
}

export function useUpdateUser(options?: BaseMutation<UserModel, { id: number; data: UpdateUserDto }>) {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) => usersApi.update(id, data),
    invalidates: [usersKeys.all],
    options,
  });
}

export function useDeleteUser(options?: BaseMutation<void, number>) {
  return useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    invalidates: [usersKeys.lists()],
    options,
  });
}

export function useSyncUserRoles(options?: BaseMutation<UserModel, { id: number; roles: string[] }>) {
  return useMutation({
    mutationFn: ({ id, roles }: { id: number; roles: string[] }) => usersApi.syncRoles(id, roles),
    invalidates: [usersKeys.all],
    options,
  });
}
