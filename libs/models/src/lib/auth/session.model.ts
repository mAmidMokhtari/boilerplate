import { UserModel } from "../user/user.model";
import type { ISession } from "./auth.interface";

export class SessionModel {
  protected props: Partial<ISession>;

  constructor(data?: Partial<ISession>) {
    this.props = data ?? {};
  }

  getUser(): UserModel | null {
    return this.props.user ? new UserModel(this.props.user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.props.user;
  }
}
