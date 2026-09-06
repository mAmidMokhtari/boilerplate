import { z } from "zod";
import { MediaTypeEnum } from "@repo/enums";
import { listQuerySchema } from "../shared/list-query.dto";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
] as const;

export const getMediaListSchema = listQuerySchema.extend({
  type: z.enum(MediaTypeEnum).optional(),
});

/**
 * Client-side pre-validation for a file input. The backend re-validates; this
 * only gives the user an early, friendly error.
 */
export const uploadImageSchema = z.object({
  file: z
    .instanceof(File, { message: "Choose a file" })
    .refine((f) => f.size <= MAX_UPLOAD_BYTES, "File must be 10MB or smaller")
    .refine(
      (f) => (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(f.type),
      "Unsupported image type"
    ),
  alt: z.string().trim().max(255).optional(),
});

export type GetMediaListDto = z.infer<typeof getMediaListSchema>;
export type UploadImageDto = z.infer<typeof uploadImageSchema>;
