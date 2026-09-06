import { z } from "zod";
import { PostStatusEnum } from "@repo/enums";
import { listQuerySchema } from "../shared/list-query.dto";
import { slugSchema } from "../shared/id-param.dto";
import { localizedStringSchema } from "../shared/localized-string.dto";

/**
 * The locales a post can be authored in. DTOs must stay framework-free, so
 * this list is duplicated from `@repo/config` on purpose — keep both in sync.
 */
const POST_LOCALES = ["en", "fa"] as const;

export const getPostsListSchema = listQuerySchema.extend({
  status: z.enum(PostStatusEnum).optional(),
  tag: z.string().optional(),
});

export const createPostSchema = z.object({
  title: localizedStringSchema(POST_LOCALES, "en", { max: 255 }),
  slug: slugSchema,
  excerpt: localizedStringSchema(POST_LOCALES, "en", { max: 500 }).optional(),
  body: localizedStringSchema(POST_LOCALES, "en", { max: 50_000 }).optional(),
  status: z.enum(PostStatusEnum).default(PostStatusEnum.DRAFT),
  cover_id: z.number().int().positive().nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
});

export const updatePostSchema = createPostSchema.partial();

export type GetPostsListDto = z.infer<typeof getPostsListSchema>;
export type GetPostsListInput = z.input<typeof getPostsListSchema>;
export type CreatePostDto = z.infer<typeof createPostSchema>;
export type CreatePostInput = z.input<typeof createPostSchema>;
export type UpdatePostDto = z.infer<typeof updatePostSchema>;
