import type { MetadataRoute } from "next";
import { STATIC_BLOG_POSTS } from "@/lib/static-blog";
import { getSiteUrl, isIndexingEnabled } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexingEnabled()) return [];

  const base = getSiteUrl();
  const paths = [
    "",
    "/services",
    "/portfolio",
    "/about",
    "/contact",
    "/blog",
    "/request",
    "/organization-consultation",
    "/track",
  ];

  const staticPages: MetadataRoute.Sitemap = paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/blog" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/services" ? 0.9 : 0.7,
  }));

  const posts = STATIC_BLOG_POSTS.filter((post) => post.status === "published");

  return [
    ...staticPages,
    ...posts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
