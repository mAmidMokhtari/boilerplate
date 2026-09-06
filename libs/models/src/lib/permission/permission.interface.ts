import type { IBaseModel } from "../base/base.interface";

export type IPermissionModel = IBaseModel & {
  name: string;
  guard_name?: string;
  /** Optional UI grouping such as "users" or "posts". */
  group?: string | null;
};
