"use client";

import { useLocale, useTranslations } from "next-intl";
import { LOCALE_NAMES, LOCALES, type LocaleCode } from "@repo/config";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { usePathname, useRouter } from "@/i18n/navigation";

/** Switches the locale while staying on the same route. */
export function LocaleSwitcher() {
  const locale = useLocale() as LocaleCode;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <Select value={locale} onValueChange={(next) => router.replace(pathname, { locale: next as LocaleCode })}>
      <SelectTrigger size="sm" className="w-28" aria-label={t("language")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LOCALES.map((code) => (
          <SelectItem key={code} value={code}>
            {LOCALE_NAMES[code]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
