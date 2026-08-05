"use client";

import { useState } from "react";
import Link from "next/link";
import { readApiResponse } from "@/lib/client-api";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: username, password, scope: "staff" }),
    });
    let data: { user: { role: string } };
    try {
      data = await readApiResponse<{ user: { role: string }; message?: string }>(
        response
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "ورود ناموفق بود.");
      setLoading(false);
      return;
    }
    window.location.href =
      data.user.role === "content_admin"
        ? "/admin/cms"
        : data.user.role === "support"
          ? "/admin/tickets"
          : "/admin";
  }

  return (
    <div className="grid min-h-screen bg-slate-950 lg:grid-cols-2" dir="rtl">
      <div className="hidden border-l border-white/10 bg-[linear-gradient(145deg,#111827,#172554)] p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center border-2 border-cyan-400 text-xl font-black">چ</span>
          <div><b>چاپخانه</b><span className="block text-xs text-slate-400">سامانه مدیریت عملیات چاپ</span></div>
        </div>
        <div>
          <p className="text-xs font-bold tracking-widest text-cyan-400">SECURE WORKSPACE</p>
          <h2 className="mt-4 max-w-lg text-4xl font-black leading-[1.5]">مدیریت سفارش، تولید و ارتباط با مشتری در یک فضای کاری متمرکز</h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">این صفحه فقط برای مدیران و کارشناسان مجاز مجموعه است. تمام نشست‌ها محدود و قابل ابطال هستند.</p>
        </div>
        <p className="text-[10px] text-slate-500">دسترسی محافظت‌شده • کنترل نقش • ثبت نشست امن</p>
      </div>
      <div className="grid place-items-center px-4 py-10">
      <div className="w-full max-w-md border border-slate-200 bg-white p-8 shadow-2xl">
        <div className="mx-auto grid h-12 w-12 place-items-center bg-slate-950 font-black text-white lg:hidden">چ</div>
        <h1 className="mt-5 text-center text-2xl font-black text-slate-950">ورود به پنل مدیریت</h1>
        <p className="mt-2 text-center text-xs text-slate-500">نام کاربری سازمانی یا شماره موبایل خود را وارد کنید</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block text-xs font-bold">نام کاربری / موبایل
            <input value={username} onChange={(e) => setUsername(e.target.value)} dir="ltr" required className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-violet-500" />
          </label>
          <label className="block text-xs font-bold">کلمه عبور
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" required className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-violet-500" />
          </label>
          <div className="flex justify-end">
            <Link href="/admin/reset-password" className="text-[11px] font-bold text-blue-700 hover:underline">رمز عبور را فراموش کرده‌اید؟</Link>
          </div>
          {error && <p className="rounded-md bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}
          <button disabled={loading} className="w-full bg-slate-950 py-3.5 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50">{loading ? "در حال ورود..." : "ورود امن به پنل"}</button>
        </form>
        <Link href="/" className="mt-5 block text-center text-[10px] text-slate-400 hover:text-slate-700">بازگشت به وب‌سایت</Link>
      </div>
      </div>
    </div>
  );
}
