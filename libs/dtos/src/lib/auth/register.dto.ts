import { z } from "zod";
import { passwordSchema } from "./login.dto";

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "At least 2 characters").max(100),
    email: z.email("Enter a valid email"),
    password: passwordSchema,
    password_confirmation: z.string(),
    accept_terms: z.literal(true, { error: "You must accept the terms" }),
  })
  .refine((v) => v.password === v.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export type RegisterDto = z.infer<typeof registerSchema>;
