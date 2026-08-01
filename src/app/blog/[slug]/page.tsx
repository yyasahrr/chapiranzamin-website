import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { formatDate } from "@/lib/constants";
import { STATIC_BLOG_POSTS } from "@/lib/static-blog";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = STATIC_BLOG_POSTS.find(
    (item) => item.slug === slug && item.status === "published"
  );
  if (!post) return {};

  return {
    title: `${post.title} | چاپ ایران‌زمین`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = STATIC_BLOG_POSTS.find(
    (item) => item.slug === slug && item.status === "published"
  );

  if (!post) notFound();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-14">
        <p className="text-xs font-bold text-cyanink">
          {formatDate(post.publishedAt)}
        </p>
        <h1 className="mt-3 text-4xl leading-tight">{post.title}</h1>
        <p className="mt-5 border-r-4 border-reg pr-4 text-sm leading-8 text-ink-700">
          {post.excerpt}
        </p>
        <article className="mt-10 whitespace-pre-line text-sm leading-9 text-ink-800">
          {post.content}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
