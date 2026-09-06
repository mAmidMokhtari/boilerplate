import type { MetadataRoute } from "next";
import { getServerEnv } from "@repo/config";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const indexable = getServerEnv().SITE_ROBOTS_INDEX;
  return {
    rules: indexable
      ? { userAgent: "*", allow: "/", disallow: ["/api/", "/*/account", "/*/login"] }
      : { userAgent: "*", disallow: "/" },
    sitemap: indexable ? absoluteUrl("/sitemap.xml") : undefined,
  };
}
