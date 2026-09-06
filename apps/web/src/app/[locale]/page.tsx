import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Button } from "@repo/ui/button";
import { Link } from "@/i18n/navigation";
import { resolveLocaleParams, type LocaleParams } from "@/lib/locale-params";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const { locale } = await resolveLocaleParams(params);
  const t = await getTranslations({ locale, namespace: "home" });
  return { title: t("title"), alternates: localizedAlternates(locale, "/") };
}

export default async function HomePage({ params }: { params: LocaleParams }) {
  const { locale } = await resolveLocaleParams(params);
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <main className="container flex flex-col items-start gap-6 py-20">
      <span className="rounded-full border px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {t("eyebrow")}
      </span>
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        {t("headline")}
      </h1>
      <p className="max-w-2xl text-lg text-muted-foreground text-pretty">{t("subheadline")}</p>
      <div className="flex gap-3">
        <Button asChild size="lg">
          <Link href="/posts">{t("ctaPrimary")}</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/login">{t("ctaSecondary")}</Link>
        </Button>
      </div>
    </main>
  );
}
