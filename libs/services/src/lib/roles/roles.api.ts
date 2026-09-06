import type { IRoleModel } from "@repo/models";
import { RoleModel } from "@repo/models";
import { apiClient } from "../shared/api-client";
import { endpoints } from "../shared/endpoints";
import type { ApiResponse } from "../shared/types";

export type RolePayload = { name: string };

export const rolesApi = {
  getList: async (): Promise<RoleModel[]> => {
    const raw = await apiClient.get<ApiResponse<IRoleModel[]>>(endpoints.roles.list);
    return raw.data.map((role) => new RoleModel(role));
  },

  getById: async (id: number): Promise<RoleModel> => {
    const raw = await apiClient.get<ApiResponse<IRoleModel>>(endpoints.roles.byId(id));
    return new RoleModel(raw.data);
  },

  create: async (data: RolePayload): Promise<RoleModel> => {
    const raw = await apiClient.post<ApiResponse<IRoleModel>>(endpoints.roles.create, data);
    return new RoleModel(raw.data);
  },

  update: async (id: number, data: RolePayload): Promise<RoleModel> => {
    const raw = await apiClient.patch<ApiResponse<IRoleModel>>(endpoints.roles.update(id), data);
    return new RoleModel(raw.data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(endpoints.roles.delete(id));
  },

  syncPermissions: async (id: number, permissions: string[]): Promise<RoleModel> => {
    const raw = await apiClient.put<ApiResponse<IRoleModel>>(endpoints.roles.syncPermissions(id), {
      permissions,
    });
    return new RoleModel(raw.data);
  },
};
