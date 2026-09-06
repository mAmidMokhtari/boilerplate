import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";

/** Sidebar shell for every authenticated admin page. */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-e bg-sidebar text-sidebar-foreground lg:block">
        <AppSidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <SiteHeader />
        <main className="container flex-1 py-6">{children}</main>
      </div>
    </div>
  );
}
