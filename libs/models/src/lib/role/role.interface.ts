import type { IBaseModel } from "../base/base.interface";
import type { IPermissionModel } from "../permission/permission.interface";

export type IRoleModel = IBaseModel & {
  name: string;
  guard_name?: string;
  permissions?: IPermissionModel[];
};
