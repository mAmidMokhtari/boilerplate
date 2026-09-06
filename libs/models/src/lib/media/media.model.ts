import { MediaTypeEnum } from "@repo/enums";
import { BaseModel } from "../base/base.model";
import type { IMediaModel, IMediaVariants } from "./media.interface";

export class MediaModel extends BaseModel<IMediaModel> {
  getFileName(): string {
    return this.props.file_name ?? "";
  }

  getMimeType(): string {
    return this.props.mime_type ?? "";
  }

  getSize(): number {
    return this.props.size ?? 0;
  }

  getType(): MediaTypeEnum {
    return this.props.type ?? MediaTypeEnum.DOCUMENT;
  }

  isImage(): boolean {
    return this.getType() === MediaTypeEnum.IMAGE;
  }

  getUrl(size: keyof IMediaVariants = "original"): string {
    const variants = this.props.variants;
    return variants?.[size] ?? variants?.original ?? this.props.url ?? "";
  }

  getAlt(): string {
    return this.props.alt ?? this.getFileName();
  }

  getDimensions(): { width: number; height: number } | null {
    if (!this.props.width || !this.props.height) return null;
    return { width: this.props.width, height: this.props.height };
  }
}
