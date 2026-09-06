import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Skeleton } from "@repo/ui/skeleton";
import { resolveLocaleParams, type LocaleParams } from "@/lib/locale-params";
import { LoginContent } from "./components";

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const { locale } = await resolveLocaleParams(params);
  const t = await getTranslations({ locale, namespace: "login" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function LoginPage({ params }: { params: LocaleParams }) {
  await resolveLocaleParams(params);
  return (
    <main className="container flex justify-center py-16">
      {/* The form hook reads `?next=` via useSearchParams, which needs a
          Suspense boundary or the page cannot be statically prerendered. */}
      <Suspense fallback={<Skeleton className="h-96 w-full max-w-sm" />}>
        <LoginContent />
      </Suspense>
    </main>
  );
}
