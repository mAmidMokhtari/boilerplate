import { BaseModel } from "../base/base.model";
import type { IPermissionModel } from "./permission.interface";

export class PermissionModel extends BaseModel<IPermissionModel> {
  getName(): string {
    return this.props.name ?? "";
  }

  /** Group derived from the name when the backend sends none ("posts.create" → "posts"). */
  getGroup(): string {
    if (this.props.group) return this.props.group;
    const [group] = this.getName().split(".");
    return group ?? "";
  }

  /** Action part of a dotted permission name ("posts.create" → "create"). */
  getAction(): string {
    const parts = this.getName().split(".");
    return parts.length > 1 ? parts.slice(1).join(".") : "";
  }
}
