import type { MetadataRoute } from "next";
import { getSiteUrl, isIndexingEnabled } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  if (!isIndexingEnabled()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/dashboard/", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
