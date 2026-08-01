"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Me = {
  id: number;
  name: string;
  role: "admin" | "content_admin" | "support" | "customer";
} | null;

const NAV = [
  { href: "/", label: "خانه" },
  { href: "/services", label: "خدمات" },
  { href: "/portfolio", label: "نمونه‌کارها" },
  { href: "/blog", label: "مجله" },
  { href: "/track", label: "رهگیری" },
  { href: "/about", label: "درباره" },
  { href: "/contact", label: "تماس" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<Me>(null);
  const pathname = usePathname();
  const isStaff = me && ["admin", "content_admin", "support"].includes(me.role);

  useEffect(() => {
    fetch("/api/auth/me", {
      credentials: "same-origin",
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setMe(d.user))
      .catch(() => setMe(null));
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink-900 bg-paper">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="brand-logo-mark relative grid h-10 w-10 overflow-hidden border-2 border-ink-900 bg-reg text-xl font-black text-paper shadow-[3px_3px_0_0_#141414]">
            <span className="poster-logo-letter">چ</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand-logo.jpg"
              alt=""
              width="600"
              height="600"
              className="brand-logo-image absolute hidden max-w-none"
            />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-black text-ink-900">
              چاپ ایران‌زمین
            </span>
            <span className="block text-[9px] font-bold tracking-widest text-ink-700">
              چاپ ▪ تبلیغات محیطی ▪ پروژه سازمانی
            </span>
          </span>
        </Link>

        <nav className="hidden items-center lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`border-x border-transparent px-4 py-2 text-sm font-bold transition ${
                pathname === item.href
                  ? "bg-ink-900 text-goldc"
                  : "text-ink-900 hover:bg-goldc"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {me ? (
            <Link
              href={isStaff ? "/admin" : "/dashboard"}
              className="brut-press border-2 border-ink-900 bg-paper px-4 py-2 text-sm font-black text-ink-900 shadow-[3px_3px_0_0_#141414]"
            >
              {isStaff ? "پنل مدیریت" : "داشبورد من"}
            </Link>
          ) : (
            <Link
              href="/login"
              className="brut-press border-2 border-ink-900 bg-paper px-4 py-2 text-sm font-black text-ink-900 shadow-[3px_3px_0_0_#141414]"
            >
              ورود
            </Link>
          )}
          <Link
            href="/request"
            className="brut-press border-2 border-ink-900 bg-reg px-4 py-2 text-sm font-black text-white shadow-[3px_3px_0_0_#141414]"
          >
            ثبت سفارش ←
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="grid h-10 w-10 place-items-center border-2 border-ink-900 bg-goldc text-ink-900 shadow-[3px_3px_0_0_#141414] lg:hidden"
          aria-label="منو"
        >
          <span className="text-xl font-black">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {open && (
        <div className="border-t-2 border-ink-900 bg-paper px-4 pb-5 pt-2 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-ink-900/20 py-3 text-sm font-black text-ink-900"
            >
              ▪ {item.label}
            </Link>
          ))}
          <div className="mt-4 flex gap-3">
            {me ? (
              <Link
                href={isStaff ? "/admin" : "/dashboard"}
                onClick={() => setOpen(false)}
                className="flex-1 border-2 border-ink-900 bg-paper px-4 py-2.5 text-center text-sm font-black shadow-[3px_3px_0_0_#141414]"
              >
                {isStaff ? "پنل مدیریت" : "داشبورد من"}
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex-1 border-2 border-ink-900 bg-paper px-4 py-2.5 text-center text-sm font-black shadow-[3px_3px_0_0_#141414]"
              >
                ورود
              </Link>
            )}
            <Link
              href="/request"
              onClick={() => setOpen(false)}
              className="flex-1 border-2 border-ink-900 bg-reg px-4 py-2.5 text-center text-sm font-black text-white shadow-[3px_3px_0_0_#141414]"
            >
              ثبت سفارش
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
