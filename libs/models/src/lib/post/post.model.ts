import { PostStatusEnum } from "@repo/enums";
import { BaseModel } from "../base/base.model";
import { MediaModel } from "../media/media.model";
import { UserModel } from "../user/user.model";
import type { ILocalizedString, IPostModel } from "./post.interface";

/** Picks `locale` from a localized map, falling back to `fallback`, then to the first value. */
export function pickLocalized(
  value: ILocalizedString | null | undefined,
  locale: string,
  fallback = "en"
): string {
  if (!value) return "";
  return value[locale] ?? value[fallback] ?? Object.values(value)[0] ?? "";
}

export class PostModel extends BaseModel<IPostModel> {
  getTitle(locale: string, fallback?: string): string {
    return pickLocalized(this.props.title, locale, fallback);
  }

  getTitles(): ILocalizedString {
    return this.props.title ?? {};
  }

  getSlug(): string {
    return this.props.slug ?? "";
  }

  getExcerpt(locale: string, fallback?: string): string {
    return pickLocalized(this.props.excerpt, locale, fallback);
  }

  getBody(locale: string, fallback?: string): string {
    return pickLocalized(this.props.body, locale, fallback);
  }

  getStatus(): PostStatusEnum {
    return this.props.status ?? PostStatusEnum.DRAFT;
  }

  isPublished(): boolean {
    return this.getStatus() === PostStatusEnum.PUBLISHED;
  }

  getPublishedAt(): Date | null {
    return this.props.published_at ? new Date(this.props.published_at) : null;
  }

  getCover(): MediaModel | null {
    return this.props.cover ? new MediaModel(this.props.cover) : null;
  }

  getAuthor(): UserModel | null {
    return this.props.author ? new UserModel(this.props.author) : null;
  }

  getTags(): string[] {
    return this.props.tags ?? [];
  }
}
