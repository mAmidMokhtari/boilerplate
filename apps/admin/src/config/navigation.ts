import { FileTextIcon, LayoutDashboardIcon, UsersIcon, type LucideIcon } from "lucide-react";
import { ROUTES } from "@/lib/routes";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Hidden unless the current admin holds this permission. */
  permission?: string;
};

export type NavGroup = {
  label?: string;
  items: NavItem[];
};

/** Sidebar contents. Adding a page = adding a line here. */
export const NAVIGATION: NavGroup[] = [
  {
    items: [{ label: "Dashboard", href: ROUTES.home, icon: LayoutDashboardIcon }],
  },
  {
    label: "Content",
    items: [{ label: "Posts", href: ROUTES.posts, icon: FileTextIcon, permission: "posts.view" }],
  },
  {
    label: "Access",
    items: [{ label: "Users", href: ROUTES.users, icon: UsersIcon, permission: "users.view" }],
  },
];
