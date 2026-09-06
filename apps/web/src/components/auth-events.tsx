"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useUnauthorized } from "@repo/auth/client";
import { authKeys } from "@repo/services";
import { usePathname, useRouter } from "@/i18n/navigation";

/**
 * Reacts to a 401 that survived the BFF refresh: drop the cached session,
 * tell the user, and send them to login with a return path.
 */
export function AuthEvents() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("common");

  useUnauthorized(() => {
    queryClient.removeQueries({ queryKey: authKeys.all });
    toast.info(t("sessionExpired"));
    router.push({ pathname: "/login", query: { next: pathname } });
  });

  return null;
}
