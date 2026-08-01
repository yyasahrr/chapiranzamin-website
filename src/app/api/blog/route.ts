import { STATIC_BLOG_POSTS } from "@/lib/static-blog";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    posts: STATIC_BLOG_POSTS.filter((post) => post.status === "published"),
  });
}
