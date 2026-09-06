"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Skeleton } from "@repo/ui/skeleton";
import { formatNumber } from "@repo/utils";
import { useData } from "./index.hook";
import { TEXTS } from "./texts";

export function Index() {
  const vm = useData();

  return (
    <div className="space-y-6">
      {vm.userName ? <p className="text-muted-foreground">{TEXTS.WELCOME.replace("{name}", vm.userName)}</p> : null}
      <div className="grid gap-4 sm:grid-cols-3">
        {vm.stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              {stat.isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-semibold tabular-nums">
                  {stat.value == null ? TEXTS.UNAVAILABLE : formatNumber(stat.value, "en")}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
