"use client";

import { useTranslations } from "next-intl";
import type { IPaginatedResponseModel, IPostModel } from "@repo/models";
import { EmptyState } from "@repo/ui/blocks/empty-state";
import { ErrorState } from "@repo/ui/blocks/error-state";
import { PaginationBar } from "@repo/ui/blocks/pagination-bar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Skeleton } from "@repo/ui/skeleton";
import { formatDate } from "@repo/utils";
import { Link } from "@/i18n/navigation";
import { usePostsPage } from "./index.hook";

export type PostsContentProps = {
  locale: string;
  initialRaw: IPaginatedResponseModel<IPostModel> | null;
  unavailable: boolean;
};

export function PostsContent({ locale, initialRaw, unavailable }: PostsContentProps) {
  const t = useTranslations("posts");
  const vm = usePostsPage({ initialRaw });

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </header>

      {vm.isError || (unavailable && !vm.data) ? (
        <ErrorState
          title={t("unavailable.title")}
          description={t("unavailable.description")}
          action={{ label: t("unavailable.retry"), onClick: vm.refetch }}
        />
      ) : vm.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : vm.posts.length === 0 ? (
        <EmptyState title={t("empty.title")} description={t("empty.description")} />
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vm.posts.map((post) => (
              <li key={post.getId()}>
                <Link href={`/posts/${post.getSlug()}`} className="block h-full">
                  <Card className="h-full transition-colors hover:bg-accent/40">
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{post.getTitle(locale)}</CardTitle>
                      <CardDescription>{formatDate(post.getPublishedAt(), locale)}</CardDescription>
                    </CardHeader>
                    {post.getExcerpt(locale) ? (
                      <CardContent>
                        <p className="line-clamp-3 text-sm text-muted-foreground">
                          {post.getExcerpt(locale)}
                        </p>
                      </CardContent>
                    ) : null}
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
          <PaginationBar
            page={vm.page}
            lastPage={vm.lastPage}
            total={vm.total}
            perPage={vm.perPage}
            onPageChange={vm.setPage}
            texts={{
              previous: t("pagination.previous"),
              next: t("pagination.next"),
              summary: ({ from, to, total }) => t("pagination.summary", { from, to, total }),
            }}
          />
        </>
      )}
    </section>
  );
}
