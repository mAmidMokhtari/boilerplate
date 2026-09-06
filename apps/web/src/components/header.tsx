"use client";

import { useTranslations } from "next-intl";
import { ThemeToggle } from "@repo/ui/blocks/theme-toggle";
import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import { useLogout, useSession } from "@repo/services";
import { Link, useRouter } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";

export function Header() {
  const t = useTranslations("nav");
  const router = useRouter();
  const { data: session, isLoading } = useSession();
  const logout = useLogout({ onSuccess: () => router.push("/") });
  const user = session?.getUser();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-14 items-center justify-between gap-4">
        <nav className="flex items-center gap-6">
          <Link href="/" className="font-semibold tracking-tight">
            {t("brand")}
          </Link>
          <Link href="/posts" className="text-sm text-muted-foreground hover:text-foreground">
            {t("posts")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle label={t("toggleTheme")} />
          {isLoading ? (
            <Skeleton className="h-9 w-20" />
          ) : user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/account">{user.getName() || t("account")}</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => logout.mutate()} disabled={logout.isPending}>
                {t("logout")}
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">{t("login")}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
