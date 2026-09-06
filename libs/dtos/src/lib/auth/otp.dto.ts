import { z } from "zod";

/** E.164-ish mobile number: optional "+", 8 to 15 digits. */
export const mobileSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{8,15}$/, "Enter a valid mobile number");

export const otpCodeSchema = z.string().regex(/^[0-9]{4,8}$/, "Enter the numeric code");

export const requestOtpSchema = z.object({
  mobile: mobileSchema,
});

export const verifyOtpSchema = z.object({
  mobile: mobileSchema,
  code: otpCodeSchema,
});

export type RequestOtpDto = z.infer<typeof requestOtpSchema>;
export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;
