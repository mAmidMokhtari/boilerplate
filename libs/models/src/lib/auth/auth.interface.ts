import type { IUserModel } from "../user/user.interface";

/** Token pair issued by the backend on login / refresh. */
export type ITokenPair = {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in?: number;
};

/** Full auth payload returned by login/register/refresh endpoints. */
export type IAuthPayload = ITokenPair & {
  user: IUserModel;
};

/** What the browser is allowed to know about the session: the user only. */
export type ISession = {
  user: IUserModel;
};
