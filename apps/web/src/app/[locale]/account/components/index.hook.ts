"use client";

import { useMe } from "@repo/services";

export function useAccountPage() {
  /* --------------------------------- APIs ---------------------------------- */
  const { data: user, isLoading, isError, refetch } = useMe("customer");

  /* --------------------------------- Return -------------------------------- */
  return { user, isLoading, isError, refetch: () => void refetch() };
}
