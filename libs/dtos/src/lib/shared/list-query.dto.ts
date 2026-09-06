import { z } from "zod";
import { SortOrderEnum } from "@repo/enums";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Integer that may arrive as a number (from code) or a numeric string (from a
 * URL query). Deliberately not `z.coerce.number()`: that types its *input* as
 * `unknown`, which makes every caller's typed object incompatible.
 */
function intParam(min: number, max?: number) {
  const bounded = max == null ? z.number().int().min(min) : z.number().int().min(min).max(max);
  return z.union([z.number(), z.string().regex(/^\d+$/, "Must be a number").transform(Number)]).pipe(bounded);
}

/**
 * Query string every paginated list endpoint understands. Extend it per
 * domain with `.extend({...})` instead of redeclaring `page`/`per_page`.
 */
export const listQuerySchema = z.object({
  page: intParam(1).default(1),
  per_page: intParam(1, MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  search: z.string().trim().max(255).optional(),
  sort_by: z.string().max(64).optional(),
  sort_order: z.enum(SortOrderEnum).optional(),
});

export type ListQueryDto = z.infer<typeof listQuerySchema>;
/** Input shape before defaults are applied (what callers actually pass). */
export type ListQueryInput = z.input<typeof listQuerySchema>;
