import { z } from "zod";

/** Positive integer id as it arrives from a route param or form field. */
export const idParamSchema = z.coerce.number().int().positive();

/** URL-safe slug: lowercase letters, digits and single hyphens. */
export const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Only lowercase letters, numbers and hyphens");

export type IdParam = z.infer<typeof idParamSchema>;
