import type { GetMediaListDto } from "@repo/dtos";
import type { IMediaModel, IPaginatedResponseModel } from "@repo/models";
import { MediaModel, PaginatedResponseModel } from "@repo/models";
import { withQuery } from "@repo/utils";
import { apiClient } from "../shared/api-client";
import { endpoints } from "../shared/endpoints";
import type { ApiResponse } from "../shared/types";

export type MediaPage = PaginatedResponseModel<IMediaModel, MediaModel>;

export const mediaApi = {
  getList: async (params: Partial<GetMediaListDto> = {}): Promise<MediaPage> => {
    const raw = await apiClient.get<IPaginatedResponseModel<IMediaModel>>(
      withQuery(endpoints.media.list, params)
    );
    return new PaginatedResponseModel(MediaModel, raw);
  },

  getById: async (id: number): Promise<MediaModel> => {
    const raw = await apiClient.get<ApiResponse<IMediaModel>>(endpoints.media.byId(id));
    return new MediaModel(raw.data);
  },

  upload: async (file: File, alt?: string): Promise<MediaModel> => {
    const formData = new FormData();
    formData.append("file", file);
    if (alt) formData.append("alt", alt);
    const raw = await apiClient.upload<ApiResponse<IMediaModel>>(endpoints.media.upload, formData);
    return new MediaModel(raw.data);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(endpoints.media.delete(id));
  },
};
