"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SiteHeader from "@/components/site-header";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      window.location.href = data.user.role === "admin" ? "/admin" : "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ورود");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="border-2 border-ink-900 bg-white shadow-[6px_6px_0_0_#141414] p-8">
          <h1 className="text-center text-xl font-black text-ink-900">ورود به حساب</h1>
          <p className="mt-2 text-center text-xs text-ink-700/70">
            مشتریان و مدیران از همین فرم وارد می‌شوند.
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink-700">شماره موبایل</label>
              <input
                className="w-full rounded-lg border-2 border-ink-900 px-3.5 py-2.5 text-sm outline-none focus:border-cyanink"
                dir="ltr" placeholder="09xxxxxxxxx" value={phone}
                onChange={(e) => setPhone(e.target.value)} required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink-700">رمز عبور</label>
              <input
                type="password"
                className="w-full rounded-lg border-2 border-ink-900 px-3.5 py-2.5 text-sm outline-none focus:border-cyanink"
                dir="ltr" value={password}
                onChange={(e) => setPassword(e.target.value)} required
              />
            </div>
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>
            )}
            <button
              disabled={loading}
              className="w-full brut-press border-2 border-ink-900 bg-reg shadow-[4px_4px_0_0_#141414] py-3 text-sm font-bold text-white transition hover:bg-reg-dark disabled:opacity-60"
            >
              {loading ? "در حال ورود..." : "ورود"}
            </button>
          </form>
          <p className="mt-5 text-center text-xs text-ink-700/70">
            حساب ندارید؟{" "}
            <Link href="/register" className="font-bold text-cyanink">ثبت‌نام کنید</Link>
          </p>
          <p className="mt-4 rounded-lg bg-paper px-3 py-2 text-center text-[11px] text-ink-700/60">
            حساب آزمایشی مدیر: <span dir="ltr">09120000000</span> / <span dir="ltr">Admin123!</span>
          </p>
        </div>
      </div>
    </div>
  );
}
