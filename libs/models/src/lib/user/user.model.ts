import { UserStatusEnum } from "@repo/enums";
import { BaseModel } from "../base/base.model";
import { RoleModel } from "../role/role.model";
import type { IUserModel } from "./user.interface";

export class UserModel extends BaseModel<IUserModel> {
  getName(): string {
    return this.props.name ?? "";
  }

  getEmail(): string {
    return this.props.email ?? "";
  }

  getMobile(): string {
    return this.props.mobile ?? "";
  }

  getAvatarUrl(): string | null {
    return this.props.avatar_url ?? null;
  }

  /** Two-letter initials for avatar fallbacks ("Jane Doe" → "JD"). */
  getInitials(): string {
    return this.getName()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }

  getStatus(): UserStatusEnum {
    return this.props.status ?? UserStatusEnum.INACTIVE;
  }

  isActive(): boolean {
    return this.getStatus() === UserStatusEnum.ACTIVE;
  }

  isEmailVerified(): boolean {
    return !!this.props.email_verified_at;
  }

  getLocale(): string | null {
    return this.props.locale ?? null;
  }

  getRoles(): RoleModel[] {
    return (this.props.roles ?? []).map((role) => new RoleModel(role));
  }

  getRoleNames(): string[] {
    return this.getRoles().map((role) => role.getName());
  }

  hasRole(name: string): boolean {
    return this.getRoleNames().includes(name);
  }

  /** Flattened permission names (direct + inherited) as the backend reports them. */
  getPermissions(): string[] {
    return this.props.permissions ?? [];
  }

  can(permission: string): boolean {
    return this.getPermissions().includes(permission);
  }
}
