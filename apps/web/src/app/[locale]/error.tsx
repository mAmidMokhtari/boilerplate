"use client";

import { useTranslations } from "next-intl";
import { ErrorState } from "@repo/ui/blocks/error-state";

export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("common.error");
  return (
    <main className="container py-12">
      <ErrorState title={t("title")} description={error.digest ?? error.message} action={{ label: t("retry"), onClick: reset }} />
    </main>
  );
}
