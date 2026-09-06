import type { IPermissionModel } from "@repo/models";
import { PermissionModel } from "@repo/models";
import { apiClient } from "../shared/api-client";
import { endpoints } from "../shared/endpoints";
import type { ApiResponse } from "../shared/types";

export const permissionsApi = {
  getList: async (): Promise<PermissionModel[]> => {
    const raw = await apiClient.get<ApiResponse<IPermissionModel[]>>(endpoints.permissions.list);
    return raw.data.map((p) => new PermissionModel(p));
  },
};
