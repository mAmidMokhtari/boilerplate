"use client";

import { LogOutIcon, MenuIcon } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { ThemeToggle } from "@repo/ui/blocks/theme-toggle";
import { Button } from "@repo/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@repo/ui/sheet";
import { Skeleton } from "@repo/ui/skeleton";
import { useLogout, useMe } from "@repo/services";
import { ROUTES } from "@/lib/routes";
import { AppSidebar } from "./app-sidebar";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { data: me, isLoading } = useMe("admin");
  const logout = useLogout({ onSuccess: () => window.location.assign(ROUTES.login) });

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
            <MenuIcon className="size-5" aria-hidden />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <AppSidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="ms-auto flex items-center gap-2">
        <ThemeToggle />
        {isLoading ? (
          <Skeleton className="size-8 rounded-full" />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
                <Avatar className="size-8">
                  <AvatarImage src={me?.getAvatarUrl() ?? undefined} alt="" />
                  <AvatarFallback>{me?.getInitials() || "?"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="space-y-0.5">
                <p className="text-sm font-medium">{me?.getName() ?? "Signed in"}</p>
                <p className="text-xs text-muted-foreground">{me?.getEmail()}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => logout.mutate()} disabled={logout.isPending}>
                <LogOutIcon className="size-4" aria-hidden />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
