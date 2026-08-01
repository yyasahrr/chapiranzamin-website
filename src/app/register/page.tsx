"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import SiteHeader from "@/components/site-header";
import { readApiResponse } from "@/lib/client-api";

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

function RegisterForm() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    emailOptIn: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await readApiResponse<{ user: { id: number }; message?: string }>(
        await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
      );
      window.location.href =
        next === "/dashboard"
          ? "/verify-account"
          : `/verify-account?next=${encodeURIComponent(next)}`;
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "خطا در ثبت‌نام");
      setLoading(false);
    }
  }

  const input =
    "mt-1.5 w-full rounded-lg border-2 border-ink-900 px-3.5 py-2.5 text-sm outline-none focus:border-cyanink";

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="border-2 border-ink-900 bg-white p-8 shadow-[6px_6px_0_0_#141414]">
        <p className="text-center text-[10px] font-bold text-cyanink">ثبت‌نام سریع</p>
        <h1 className="mt-2 text-center text-xl font-black text-ink-900">ساخت حساب کاربری</h1>
        <p className="mt-2 text-center text-xs leading-6 text-ink-700/70">
          برای ساخت حساب در این مرحله کد تأیید نیاز نیست؛ تأیید شماره و تکمیل مشخصات بعداً انجام می‌شود.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-xs font-bold text-ink-700">
            نام و نام‌خانوادگی
            <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label className="block text-xs font-bold text-ink-700">
            شماره موبایل
            <input className={input} dir="ltr" inputMode="numeric" placeholder="09xxxxxxxxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </label>
          <label className="block text-xs font-bold text-ink-700">
            ایمیل اختیاری
            <input className={input} dir="ltr" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="block text-xs font-bold text-ink-700">
            رمز عبور
            <input className={input} dir="ltr" type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </label>
          <label className="flex items-start gap-2 text-xs leading-6 text-ink-700">
            <input type="checkbox" checked={form.emailOptIn} onChange={(e) => setForm({ ...form, emailOptIn: e.target.checked })} className="mt-1" />
            مایل هستم اطلاعیه‌ها و پیشنهادها را با ایمیل دریافت کنم.
          </label>
          {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
          <button disabled={loading} className="brut-press w-full border-2 border-ink-900 bg-reg py-3 text-sm font-bold text-white shadow-[4px_4px_0_0_#141414] disabled:opacity-60">
            {loading ? "در حال ساخت حساب..." : "ساخت حساب"}
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-ink-700/70">
          حساب دارید؟{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-bold text-cyanink">وارد شوید</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Suspense><RegisterForm /></Suspense>
    </div>
  );
}
