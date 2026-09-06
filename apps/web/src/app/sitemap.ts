import type { MetadataRoute } from "next";
import { LOCALES } from "@repo/config";
import { absoluteUrl } from "@/lib/seo";

const STATIC_PATHS = ["", "/posts"];

/** Static routes per locale. Extend with paginated entity sitemaps as the site grows. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return LOCALES.flatMap((locale) =>
    STATIC_PATHS.map((path) => ({
      url: absoluteUrl(`/${locale}${path}`),
      lastModified: now,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [l, absoluteUrl(`/${l}${path}`)])),
      },
    }))
  );
}
