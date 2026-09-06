"use client";

import { usePathname } from "next/navigation";
import { useUnauthorized } from "@repo/auth/client";
import { ROUTES } from "@/lib/routes";

/** A 401 that survived the BFF refresh means the session is gone: hard-redirect to login. */
export function AuthEvents() {
  const pathname = usePathname();

  useUnauthorized(() => {
    if (pathname.startsWith(ROUTES.login)) return;
    const next = encodeURIComponent(pathname);
    window.location.assign(`${ROUTES.login}?next=${next}`);
  });

  return null;
}
