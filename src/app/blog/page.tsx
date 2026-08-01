import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { formatDate } from "@/lib/constants";
import { STATIC_BLOG_POSTS } from "@/lib/static-blog";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "مجله چاپ و تبلیغات | چاپ ایران‌زمین",
  description:
    "آموزش‌ها و راهنماهای تخصصی چاپ، تبلیغات محیطی، طراحی و اجرای کمپین.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = STATIC_BLOG_POSTS.filter((post) => post.status === "published");

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-xs font-black text-reg">مجله ایران‌زمین</p>
        <h1 className="mt-2 text-4xl">دانش چاپ، طراحی و تبلیغات</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-ink-700">
          راهنماهای کاربردی برای انتخاب بهتر، کاهش هزینه و اجرای حرفه‌ای پروژه‌های
          چاپی.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.id}
              className="border-2 border-ink-900 bg-white p-6 shadow-[5px_5px_0_0_#141414]"
            >
              <p className="text-[10px] font-bold text-cyanink">
                {formatDate(post.publishedAt)}
              </p>
              <h2 className="mt-3 text-2xl">{post.title}</h2>
              <p className="mt-3 text-xs leading-6 text-ink-700">{post.excerpt}</p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-5 inline-block text-xs font-black text-reg"
              >
                مطالعه مقاله ←
              </Link>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
