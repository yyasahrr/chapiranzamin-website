"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const NAV = [
  {
    label: "فضای کاری",
    items: [
      ["overview", "نمای کلی", "/admin", "⌂"],
      ["tickets", "تیکت‌ها", "/admin/tickets", "◉"],
      ["orders", "سفارش‌ها", "/admin/orders", "▣"],
      ["workflow", "گردش کار", "/admin/workflow", "⌁"],
    ],
  },
  {
    label: "کسب‌وکار",
    items: [
      ["services", "خدمات و قیمت‌ها", "/admin/services", "◇"],
      ["finance", "مالی و فاکتورها", "/admin/finance", "₮"],
      ["crm", "مشتریان CRM", "/admin/crm", "♧"],
      ["users", "کاربران", "/admin/users", "♙"],
    ],
  },
  {
    label: "سیستم",
    items: [
      ["analytics", "گزارش‌ها", "/admin/analytics", "↗"],
      ["files", "مدیریت فایل", "/admin/files", "▤"],
      ["notifications", "اعلان‌ها", "/admin/notifications", "♢"],
      ["emails", "ایمیل همگانی", "/admin/emails", "✉"],
      ["cms", "محتوا CMS", "/admin/cms", "✎"],
      ["settings", "تنظیمات", "/admin/settings", "⚙"],
    ],
  },
] as const;

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("مدیر");
  const [role, setRole] = useState("admin");
  const isLoginPage =
    pathname === "/admin/login" || pathname === "/admin/reset-password";

  useEffect(() => {
    if (isLoginPage) return;
    fetch("/api/auth/me", { cache: "no-store", credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) throw new Error("unauthorized");
        const data = await response.json();
        if (!["admin", "content_admin", "support"].includes(data.user.role)) {
          router.replace("/admin/login");
          return;
        }
        const section = pathname.split("/")[2] || "overview";
        const allowed =
          data.user.role === "admin" ||
          (data.user.role === "content_admin" &&
            ["cms", "blog", "files", "notifications"].includes(section)) ||
          (data.user.role === "support" &&
            ["tickets", "orders", "crm", "notifications"].includes(section));
        if (!allowed) {
          router.replace(
            data.user.role === "content_admin" ? "/admin/cms" : "/admin/tickets"
          );
          return;
        }
        setRole(data.user.role);
        setName(data.user.name);
        setReady(true);
      })
      .catch(() => router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`));
  }, [isLoginPage, pathname, router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  if (isLoginPage) return children;

  if (!ready)
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f8fa]">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          در حال آماده‌سازی فضای کاری
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-950" dir="rtl">
      {open && (
        <button
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="بستن منو"
        />
      )}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-[260px] flex-col border-l border-slate-200 bg-[#fbfbfc] transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-950 text-sm font-black text-white">
              چ
            </span>
            <span>
              <span className="block text-sm font-black">چاپخانه</span>
              <span className="block text-[10px] text-slate-400">Control center</span>
            </span>
          </Link>
          <button className="text-slate-400 lg:hidden" onClick={() => setOpen(false)}>×</button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-1.5 px-2 text-[10px] font-bold tracking-wide text-slate-400">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.filter(([key]) =>
                  role === "admin" ||
                  (role === "content_admin" && ["cms", "files", "notifications"].includes(key)) ||
                  (role === "support" && ["tickets", "orders", "crm", "notifications"].includes(key))
                ).map(([key, label, href, icon]) => {
                  const active = href === "/admin"
                    ? pathname === href
                    : pathname.startsWith(href);
                  return (
                    <Link
                      key={key}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-md px-2.5 py-2 text-[13px] font-semibold transition ${
                        active
                          ? "bg-slate-200/70 text-slate-950"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      }`}
                    >
                      <span className={`grid h-5 w-5 place-items-center text-base ${active ? "text-violet-600" : "text-slate-400"}`}>
                        {icon}
                      </span>
                      {label}
                      {key === "tickets" && (
                        <span className="mr-auto rounded-full bg-violet-100 px-1.5 text-[10px] text-violet-700">Live</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <div className="flex items-center gap-2 rounded-lg p-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 text-xs font-black text-white">
              {name.slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold">{name}</p>
              <p className="text-[10px] text-slate-400">Administrator</p>
            </div>
            <button onClick={logout} title="خروج" className="text-slate-400 hover:text-red-500">↪</button>
          </div>
        </div>
      </aside>

      <div className="lg:mr-[260px]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-7">
          <button
            onClick={() => setOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 lg:hidden"
          >
            ☰
          </button>
          <div className="relative max-w-lg flex-1">
            <span className="absolute right-3 top-2 text-slate-400">⌕</span>
            <input
              placeholder="جست‌وجوی سفارش، مشتری یا کد رهگیری..."
              className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pr-9 pl-16 text-xs outline-none focus:border-violet-400 focus:bg-white"
            />
            <kbd className="absolute left-2 top-2 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] text-slate-400">⌘ K</kbd>
          </div>
          <Link href="/" className="hidden text-xs font-semibold text-slate-500 hover:text-slate-900 sm:block">
            مشاهده سایت ↗
          </Link>
          <Link href="/admin/notifications" className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-500">
            ♢
          </Link>
        </header>
        <main className="p-4 md:p-7">{children}</main>
      </div>
    </div>
  );
}
