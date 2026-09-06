import type { PostStatusEnum } from "@repo/enums";
import type { IBaseModel } from "../base/base.interface";
import type { IMediaModel } from "../media/media.interface";
import type { IUserModel } from "../user/user.interface";

/**
 * Localized string map keyed by locale code (`{ en: "Hello", fa: "سلام" }`).
 * Translatable entities use this instead of a flat string.
 */
export type ILocalizedString = Record<string, string>;

/**
 * Example domain used throughout the boilerplate to demonstrate a full
 * vertical slice: model → dto → endpoint → api → hooks → page. Replace it
 * with your first real entity, or keep it as a reference.
 */
export type IPostModel = IBaseModel & {
  title: ILocalizedString;
  slug: string;
  excerpt?: ILocalizedString | null;
  body?: ILocalizedString | null;
  status: PostStatusEnum;
  published_at?: string | null;
  cover?: IMediaModel | null;
  author?: IUserModel | null;
  tags?: string[];
};
