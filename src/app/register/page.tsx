"use client";

import Link from "next/link";
import { useState } from "react";
import SiteHeader from "@/components/site-header";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ثبت‌نام");
      setLoading(false);
    }
  }

  const input =
    "w-full rounded-lg border-2 border-ink-900 px-3.5 py-2.5 text-sm outline-none focus:border-cyanink";

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="border-2 border-ink-900 bg-white shadow-[6px_6px_0_0_#141414] p-8">
          <h1 className="text-center text-xl font-black text-ink-900">ساخت حساب کاربری</h1>
          <p className="mt-2 text-center text-xs text-ink-700/70">
            با حساب کاربری، درخواست‌ها را ثبت و در داشبورد پیگیری کنید.
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink-700">نام و نام‌خانوادگی</label>
              <input className={input} value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink-700">شماره موبایل</label>
              <input className={input} dir="ltr" placeholder="09xxxxxxxxx" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink-700">ایمیل (اختیاری)</label>
              <input className={input} dir="ltr" type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink-700">رمز عبور</label>
              <input className={input} dir="ltr" type="password" minLength={6} value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>
            )}
            <button
              disabled={loading}
              className="w-full brut-press border-2 border-ink-900 bg-reg shadow-[4px_4px_0_0_#141414] py-3 text-sm font-bold text-white transition hover:bg-reg-dark disabled:opacity-60"
            >
              {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
            </button>
          </form>
          <p className="mt-5 text-center text-xs text-ink-700/70">
            حساب دارید؟{" "}
            <Link href="/login" className="font-bold text-cyanink">وارد شوید</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
