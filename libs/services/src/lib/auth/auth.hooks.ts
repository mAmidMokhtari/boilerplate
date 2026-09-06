"use client";

import { useQueryClient } from "@tanstack/react-query";
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
import type { SessionModel, UserModel } from "@repo/models";
import { useMutation, useQuery } from "../shared/hooks";
import type { BaseMutation, BaseQuery } from "../shared/types";
import { authApi } from "./auth.api";
import { authKeys } from "./auth.query-keys";

type AuthedAudience = Exclude<ApiAudience, "general">;

export function useSession(options: BaseQuery<SessionModel> = {}) {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: () => authApi.session(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useMe(audience: AuthedAudience, options: BaseQuery<UserModel> = {}) {
  return useQuery({
    queryKey: authKeys.me(audience),
    queryFn: () => authApi.me(audience),
    ...options,
  });
}

export function useLogin(options?: BaseMutation<SessionModel, LoginDto>) {
  return useMutation({
    mutationFn: (data: LoginDto) => authApi.login(data),
    invalidates: [authKeys.all],
    options,
  });
}

export function useRegister(options?: BaseMutation<SessionModel, RegisterDto>) {
  return useMutation({
    mutationFn: (data: RegisterDto) => authApi.register(data),
    invalidates: [authKeys.all],
    options,
  });
}

export function useLogout(options?: BaseMutation<void, void>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.logout(),
    options: {
      ...options,
      onSuccess: (data, variables) => {
        // Drop every cached query — nothing fetched as the old user may survive.
        queryClient.clear();
        options?.onSuccess?.(data, variables);
      },
    },
  });
}

export function useUpdateProfile(
  audience: AuthedAudience,
  options?: BaseMutation<UserModel, UpdateProfileDto>
) {
  return useMutation({
    mutationFn: (data: UpdateProfileDto) => authApi.updateProfile(audience, data),
    invalidates: [authKeys.me(audience), authKeys.session()],
    options,
  });
}

export function useChangePassword(
  audience: AuthedAudience,
  options?: BaseMutation<void, ChangePasswordDto>
) {
  return useMutation({
    mutationFn: (data: ChangePasswordDto) => authApi.changePassword(audience, data),
    options,
  });
}

export function useRequestOtp(options?: BaseMutation<{ expires_in: number }, RequestOtpDto>) {
  return useMutation({ mutationFn: (data: RequestOtpDto) => authApi.requestOtp(data), options });
}

export function useVerifyOtp(options?: BaseMutation<SessionModel, VerifyOtpDto>) {
  return useMutation({
    mutationFn: (data: VerifyOtpDto) => authApi.verifyOtp(data),
    invalidates: [authKeys.all],
    options,
  });
}

export function useForgotPassword(options?: BaseMutation<void, ForgotPasswordDto>) {
  return useMutation({ mutationFn: (data: ForgotPasswordDto) => authApi.forgotPassword(data), options });
}

export function useResetPassword(options?: BaseMutation<void, ResetPasswordDto>) {
  return useMutation({ mutationFn: (data: ResetPasswordDto) => authApi.resetPassword(data), options });
}
