"use client";

import { useTranslations } from "next-intl";
import { ErrorState } from "@repo/ui/blocks/error-state";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Badge } from "@repo/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Skeleton } from "@repo/ui/skeleton";
import { formatDate } from "@repo/utils";
import { useAccountPage } from "./index.hook";

export type AccountContentProps = { locale: string };

export function AccountContent({ locale }: AccountContentProps) {
  const t = useTranslations("account");
  const vm = useAccountPage();

  if (vm.isLoading) return <Skeleton className="h-48 w-full max-w-lg" />;
  if (vm.isError || !vm.user) {
    return <ErrorState title={t("error.title")} description={t("error.description")} action={{ label: t("error.retry"), onClick: vm.refetch }} />;
  }

  return (
    <Card className="max-w-lg">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="size-14">
          <AvatarImage src={vm.user.getAvatarUrl() ?? undefined} alt="" />
          <AvatarFallback>{vm.user.getInitials()}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{vm.user.getName()}</CardTitle>
          <p className="text-sm text-muted-foreground">{vm.user.getEmail() || vm.user.getMobile()}</p>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("status")}</span>
          <Badge variant={vm.user.isActive() ? "default" : "secondary"}>{vm.user.getStatus()}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t("memberSince")}</span>
          <span>{formatDate(vm.user.getCreatedAt(), locale)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
