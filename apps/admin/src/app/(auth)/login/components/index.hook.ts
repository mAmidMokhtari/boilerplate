"use client";

import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginDto } from "@repo/dtos";
import { useLogin } from "@repo/services";
import { applyServerErrors } from "@repo/ui/blocks/form-errors";
import { ROUTES } from "@/lib/routes";

export function useData() {
  /* --------------------------------- State --------------------------------- */
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("next");

  /* --------------------------------- Form ---------------------------------- */
  const form = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  /* --------------------------------- APIs ---------------------------------- */
  const login = useLogin({
    // Full navigation so the middleware guard re-evaluates with the new cookies.
    onSuccess: () => window.location.assign(returnTo && returnTo.startsWith("/") ? returnTo : ROUTES.home),
    onError: (error) => applyServerErrors(form, error),
  });

  /* -------------------------------- Handlers ------------------------------- */
  const onSubmit = form.handleSubmit((values) => login.mutate(values));

  /* --------------------------------- Return -------------------------------- */
  return { form, onSubmit, isPending: login.isPending };
}
