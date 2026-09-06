import type { UserStatusEnum } from "@repo/enums";
import type { IBaseModel } from "../base/base.interface";
import type { IRoleModel } from "../role/role.interface";

export type IUserModel = IBaseModel & {
  name: string;
  email: string | null;
  mobile: string | null;
  avatar_url?: string | null;
  status: UserStatusEnum;
  email_verified_at?: string | null;
  locale?: string | null;
  timezone?: string | null;
  roles?: IRoleModel[];
  permissions?: string[];
};
