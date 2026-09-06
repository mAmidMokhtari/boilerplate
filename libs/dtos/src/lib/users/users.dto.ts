import { z } from "zod";
import { UserStatusEnum } from "@repo/enums";
import { listQuerySchema } from "../shared/list-query.dto";
import { passwordSchema } from "../auth/login.dto";

export const getUsersListSchema = listQuerySchema.extend({
  status: z.enum(UserStatusEnum).optional(),
  role: z.string().optional(),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  password: passwordSchema,
  status: z.enum(UserStatusEnum).default(UserStatusEnum.ACTIVE),
  roles: z.array(z.string()).default([]),
});

export const updateUserSchema = createUserSchema
  .omit({ password: true })
  .partial()
  .extend({ password: passwordSchema.optional() });

export type GetUsersListDto = z.infer<typeof getUsersListSchema>;
export type GetUsersListInput = z.input<typeof getUsersListSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
