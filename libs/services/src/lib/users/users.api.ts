import type { CreateUserDto, GetUsersListInput, UpdateUserDto } from "@repo/dtos";
import type { IPaginatedResponseModel, IUserModel } from "@repo/models";
import { PaginatedResponseModel, UserModel } from "@repo/models";
import { withQuery } from "@repo/utils";
import { apiClient } from "../shared/api-client";
import { endpoints } from "../shared/endpoints";
import type { ApiResponse } from "../shared/types";

export type UsersPage = PaginatedResponseModel<IUserModel, UserModel>;

export const usersApi = {
  getList: async (params: GetUsersListInput = {}): Promise<UsersPage> => {
    const raw = await apiClient.get<IPaginatedResponseModel<IUserModel>>(
      withQuery(endpoints.users.list, params)
    );
    return new PaginatedResponseModel(UserModel, raw);
  },

  getById: async (id: number): Promise<UserModel> => {
    const raw = await apiClient.get<ApiResponse<IUserModel>>(endpoints.users.byId(id));
    return new UserModel(raw.data);
  },

  create: async (data: CreateUserDto): Promise<UserModel> => {
    const raw = await apiClient.post<ApiResponse<IUserModel>>(endpoints.users.create, data);
    return new UserModel(raw.data);
  },

  update: async (id: number, data: UpdateUserDto): Promise<UserModel> => {
    const raw = await apiClient.patch<ApiResponse<IUserModel>>(endpoints.users.update(id), data);
    return new UserModel(raw.data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(endpoints.users.delete(id));
  },

  syncRoles: async (id: number, roles: string[]): Promise<UserModel> => {
    const raw = await apiClient.put<ApiResponse<IUserModel>>(endpoints.users.syncRoles(id), {
      roles,
    });
    return new UserModel(raw.data);
  },
};
