import type { ApiAudience } from "@repo/config";
import type {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  RequestOtpDto,
  ResetPasswordDto,
  UpdateProfileDto,
  VerifyOtpDto,
} from "@repo/dtos";
import type { ISession, IUserModel } from "@repo/models";
import { SessionModel, UserModel } from "@repo/models";
import { apiClient } from "../shared/api-client";
import { endpoints } from "../shared/endpoints";
import type { ApiResponse } from "../shared/types";

type AuthedAudience = Exclude<ApiAudience, "general">;

/**
 * Browser-facing auth API. Login/register/logout hit the app's own
 * same-origin route handlers (which set httpOnly cookies); `me` goes
 * through the BFF proxy like any other authenticated call.
 */
export const authApi = {
  login: async (data: LoginDto): Promise<SessionModel> => {
    const raw = await apiClient.post<ApiResponse<ISession>>(endpoints.auth.login, data);
    return new SessionModel(raw.data);
  },

  register: async (data: RegisterDto): Promise<SessionModel> => {
    const raw = await apiClient.post<ApiResponse<ISession>>(endpoints.auth.register, data);
    return new SessionModel(raw.data);
  },

  logout: async (): Promise<void> => {
    await apiClient.post<void>(endpoints.auth.logout);
  },

  /** Lightweight session probe served by the app from the cookie, no backend round-trip. */
  session: async (): Promise<SessionModel> => {
    const raw = await apiClient.get<ApiResponse<Partial<ISession>>>(endpoints.auth.session);
    return new SessionModel(raw.data);
  },

  me: async (audience: AuthedAudience): Promise<UserModel> => {
    const raw = await apiClient.get<ApiResponse<IUserModel>>(endpoints.me(audience).profile);
    return new UserModel(raw.data);
  },

  updateProfile: async (audience: AuthedAudience, data: UpdateProfileDto): Promise<UserModel> => {
    const raw = await apiClient.patch<ApiResponse<IUserModel>>(endpoints.me(audience).updateProfile, data);
    return new UserModel(raw.data);
  },

  changePassword: async (audience: AuthedAudience, data: ChangePasswordDto): Promise<void> => {
    await apiClient.post<void>(endpoints.me(audience).changePassword, data);
  },

  requestOtp: async (data: RequestOtpDto): Promise<{ expires_in: number }> => {
    const raw = await apiClient.post<ApiResponse<{ expires_in: number }>>(
      endpoints.auth.backend.requestOtp,
      data
    );
    return raw.data;
  },

  verifyOtp: async (data: VerifyOtpDto): Promise<SessionModel> => {
    const raw = await apiClient.post<ApiResponse<ISession>>(endpoints.auth.backend.verifyOtp, data);
    return new SessionModel(raw.data);
  },

  forgotPassword: async (data: ForgotPasswordDto): Promise<void> => {
    await apiClient.post<void>(endpoints.auth.backend.forgotPassword, data);
  },

  resetPassword: async (data: ResetPasswordDto): Promise<void> => {
    await apiClient.post<void>(endpoints.auth.backend.resetPassword, data);
  },
};
