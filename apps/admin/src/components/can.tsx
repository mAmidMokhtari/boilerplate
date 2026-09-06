"use client";

import type { ReactNode } from "react";
import { useCan } from "@repo/auth/client";

export type CanProps = {
  permission: string | string[];
  children: ReactNode;
  /** Rendered while loading or when the permission is missing. */
  fallback?: ReactNode;
};

/** Renders children only once the current admin is confirmed to hold `permission`. */
export function Can({ permission, children, fallback = null }: CanProps) {
  const { can, isLoading } = useCan("admin", permission);
  if (isLoading || !can) return <>{fallback}</>;
  return <>{children}</>;
}
