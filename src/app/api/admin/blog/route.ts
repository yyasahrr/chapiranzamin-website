import type { NextRequest } from "next/server";
import { notImplementedPhpRoute } from "@/lib/php-backend";
import { STATIC_BLOG_POSTS } from "@/lib/static-blog";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ posts: STATIC_BLOG_POSTS });
}

export function POST(_request: NextRequest) {
  return notImplementedPhpRoute(
    "مدیریت و ذخیره‌سازی وبلاگ باید در بک‌اند PHP پیاده‌سازی شود."
  );
}
