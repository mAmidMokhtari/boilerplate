import type { MediaTypeEnum } from "@repo/enums";
import type { IBaseModel } from "../base/base.interface";

/** Responsive variants the backend generates for an uploaded image. */
export type IMediaVariants = {
  original: string;
  sm?: string;
  md?: string;
  lg?: string;
};

export type IMediaModel = IBaseModel & {
  file_name: string;
  mime_type: string;
  size: number;
  type: MediaTypeEnum;
  url: string;
  variants?: IMediaVariants | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};
