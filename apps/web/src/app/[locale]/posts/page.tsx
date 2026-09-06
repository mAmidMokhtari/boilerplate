import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { resolveLocaleParams, type LocaleParams } from "@/lib/locale-params";
import { fetchPostsList } from "@/lib/posts";
import { localizedAlternates } from "@/lib/seo";
import { PostsContent } from "./components";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const { locale } = await resolveLocaleParams(params);
  const t = await getTranslations({ locale, namespace: "posts" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: localizedAlternates(locale, "/posts"),
  };
}

/**
 * Server Component: fetches the first page with cache tags and hands the raw
 * payload to the client subtree, which owns pagination from there.
 */
export default async function PostsPage({ params }: { params: LocaleParams }) {
  const { locale } = await resolveLocaleParams(params);
  const initial = await fetchPostsList();

  return (
    <main className="container py-10">
      <PostsContent
        locale={locale}
        initialRaw={initial.status === "ok" ? initial.raw : null}
        unavailable={initial.status === "unavailable"}
      />
    </main>
  );
}
