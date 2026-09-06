"use client";

import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginDto } from "@repo/dtos";
import { useLogin } from "@repo/services";
import { applyServerErrors } from "@repo/ui/blocks/form-errors";
import { useRouter } from "@/i18n/navigation";

export function useLoginPage() {
  /* --------------------------------- State --------------------------------- */
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("next");

  /* --------------------------------- Form ---------------------------------- */
  const form = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  /* --------------------------------- APIs ---------------------------------- */
  const login = useLogin({
    onSuccess: () => router.push(returnTo && returnTo.startsWith("/") ? returnTo : "/account"),
    onError: (error) => applyServerErrors(form, error),
  });

  /* -------------------------------- Handlers ------------------------------- */
  const onSubmit = form.handleSubmit((values) => login.mutate(values));

  /* --------------------------------- Return -------------------------------- */
  return { form, onSubmit, isPending: login.isPending };
}
