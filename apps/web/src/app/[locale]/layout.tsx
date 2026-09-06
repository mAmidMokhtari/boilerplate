import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Toaster } from "sonner";
import type { ReactNode } from "react";
import { isRtlLocale } from "@repo/config";
import { fontVariables, fontVarForDirection } from "@/assets/fonts";
import { routing } from "@/i18n/routing";
import { resolveLocaleParams, type LocaleParams } from "@/lib/locale-params";
import { robotsDirective } from "@/lib/seo";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "@/styles/globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const { locale } = await resolveLocaleParams(params);
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: { default: t("title"), template: `%s · ${t("title")}` },
    description: t("description"),
    robots: robotsDirective(),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: LocaleParams;
}) {
  const { locale } = await resolveLocaleParams(params);
  const messages = await getMessages();
  const rtl = isRtlLocale(locale);

  return (
    <html
      lang={locale}
      dir={rtl ? "rtl" : "ltr"}
      className={fontVariables}
      style={{ ["--font-sans" as string]: fontVarForDirection(rtl) }}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
            <Toaster
              position={rtl ? "top-left" : "top-right"}
              richColors
              closeButton
              dir={rtl ? "rtl" : "ltr"}
            />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
