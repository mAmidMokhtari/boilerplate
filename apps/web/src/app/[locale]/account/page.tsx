import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { resolveLocaleParams, type LocaleParams } from "@/lib/locale-params";
import { AccountContent } from "./components";

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const { locale } = await resolveLocaleParams(params);
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

/** Protected by the middleware auth guard (see src/proxy.ts). */
export default async function AccountPage({ params }: { params: LocaleParams }) {
  const { locale } = await resolveLocaleParams(params);
  return (
    <main className="container py-10">
      <AccountContent locale={locale} />
    </main>
  );
}
