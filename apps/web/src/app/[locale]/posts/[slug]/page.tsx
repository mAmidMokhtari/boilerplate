import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PostModel } from "@repo/models";
import { ErrorState } from "@repo/ui/blocks/error-state";
import { formatDate } from "@repo/utils";
import { resolveLocaleParams } from "@/lib/locale-params";
import { fetchPostBySlug } from "@/lib/posts";
import { localizedAlternates } from "@/lib/seo";

export const revalidate = 60;

type PostParams = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: PostParams }): Promise<Metadata> {
  const { locale, slug } = await resolveLocaleParams(params);
  const result = await fetchPostBySlug(slug);
  if (result.status !== "ok") return {};
  const post = new PostModel(result.raw);
  const cover = post.getCover();
  return {
    title: post.getTitle(locale),
    description: post.getExcerpt(locale) || undefined,
    alternates: localizedAlternates(locale, `/posts/${slug}`),
    openGraph: { title: post.getTitle(locale), images: cover ? [cover.getUrl("lg")] : undefined },
  };
}

/** Fully server-rendered detail page: no client hook needed, so no components/ folder. */
export default async function PostPage({ params }: { params: PostParams }) {
  const { locale, slug } = await resolveLocaleParams(params);
  const t = await getTranslations({ locale, namespace: "posts" });
  const result = await fetchPostBySlug(slug);

  if (result.status === "not-found") notFound();
  if (result.status === "unavailable") {
    return (
      <main className="container py-10">
        <ErrorState title={t("unavailable.title")} description={t("unavailable.description")} />
      </main>
    );
  }

  const post = new PostModel(result.raw);
  const cover = post.getCover();

  return (
    <main className="container max-w-3xl space-y-8 py-10">
      <header className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {formatDate(post.getPublishedAt(), locale, { dateStyle: "long" })}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance">
          {post.getTitle(locale)}
        </h1>
        {post.getExcerpt(locale) ? (
          <p className="text-lg text-muted-foreground">{post.getExcerpt(locale)}</p>
        ) : null}
      </header>
      {cover ? (
        // Remote CMS images have unknown dimensions, so a plain <img> is deliberate here.
        <img src={cover.getUrl("lg")} alt={cover.getAlt()} className="w-full rounded-lg border" />
      ) : null}
      <article className="prose prose-neutral max-w-none dark:prose-invert whitespace-pre-wrap">
        {post.getBody(locale)}
      </article>
    </main>
  );
}
