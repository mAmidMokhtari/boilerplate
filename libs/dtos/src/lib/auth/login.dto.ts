import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .max(128, "At most 128 characters");

/** Email + password login. */
export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: passwordSchema,
  remember: z.boolean().optional(),
});

export type LoginDto = z.infer<typeof loginSchema>;
