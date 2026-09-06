import { BaseModel } from "../base/base.model";
import { PermissionModel } from "../permission/permission.model";
import type { IRoleModel } from "./role.interface";

export class RoleModel extends BaseModel<IRoleModel> {
  getName(): string {
    return this.props.name ?? "";
  }

  getGuardName(): string {
    return this.props.guard_name ?? "";
  }

  getPermissions(): PermissionModel[] {
    return (this.props.permissions ?? []).map((p) => new PermissionModel(p));
  }

  getPermissionNames(): string[] {
    return this.getPermissions().map((p) => p.getName());
  }
}
