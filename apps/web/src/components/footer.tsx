import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="border-t">
      <div className="container flex h-14 items-center justify-between text-sm text-muted-foreground">
        <span>{t("copyright", { year: new Date().getFullYear() })}</span>
        <span>{t("tagline")}</span>
      </div>
    </footer>
  );
}
