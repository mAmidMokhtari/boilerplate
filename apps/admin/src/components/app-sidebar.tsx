"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@repo/utils";
import { useMe } from "@repo/services";
import { NAVIGATION } from "@/config/navigation";
import { ROUTES } from "@/lib/routes";

export type AppSidebarProps = {
  /** Called after a link is clicked (closes the mobile sheet). */
  onNavigate?: () => void;
  className?: string;
};

/**
 * Navigation column. Items with a `permission` are hidden until the current
 * admin's permissions are known and include it.
 */
export function AppSidebar({ onNavigate, className }: AppSidebarProps) {
  const pathname = usePathname();
  const { data: me } = useMe("admin");

  return (
    <nav aria-label="Main" className={cn("flex h-full flex-col gap-6 p-4", className)}>
      <Link
        href={ROUTES.home}
        className="px-2 text-lg font-semibold tracking-tight"
        onClick={onNavigate}
      >
        Admin
      </Link>

      {NAVIGATION.map((group, i) => {
        const items = group.items.filter((item) => !item.permission || me?.can(item.permission));
        if (items.length === 0) return null;
        return (
          <div key={group.label ?? i} className="space-y-1">
            {group.label ? (
              <p className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {group.label}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active =
                  item.href === ROUTES.home
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                        active
                          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon className="size-4" aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
