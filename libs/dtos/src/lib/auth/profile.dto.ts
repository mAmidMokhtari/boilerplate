import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  locale: z.string().min(2).max(10).optional(),
  timezone: z.string().max(64).optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
