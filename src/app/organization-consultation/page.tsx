"use client";

import Link from "next/link";
import { useState } from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { readApiResponse } from "@/lib/client-api";
import { ORG_TYPES } from "@/lib/constants";

const input =
  "mt-2 w-full rounded-lg border-2 border-ink-900 bg-white px-3.5 py-2.5 text-sm text-ink-900 outline-none transition focus:border-cyanink focus:ring-2 focus:ring-cyanink/20";

export default function OrganizationConsultationPage() {
  const [form, setForm] = useState({
    organizationName: "",
    organizationType: "",
    employeeCount: "",
    website: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    projectScope: "",
    budgetRange: "unknown",
    preferredContact: "phone",
    address: "",
    goals: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trackingCode, setTrackingCode] = useState("");

  function update(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await readApiResponse<{
        id: number;
        trackingCode: string;
        message?: string;
      }>(
        await fetch("/api/organization-consultations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
      );
      setTrackingCode(result.trackingCode);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "ثبت درخواست مشاوره ناموفق بود."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main>
        <section className="corporate-hero border-b-2 border-ink-900">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1fr_280px] md:items-center md:py-16">
            <div>
            <p className="inline-block border-2 border-ink-900 bg-goldc px-3 py-1 text-xs font-black text-ink-900 shadow-[3px_3px_0_0_#141414]">
              همکاری B2B و سازمانی
            </p>
            <h1 className="mt-5 text-3xl font-black leading-tight text-ink-900 md:text-5xl">
              درخواست مشاوره اختصاصی سازمان‌ها
            </h1>
            <p className="mt-5 max-w-2xl border-r-4 border-cyanink pr-4 text-sm leading-8 text-ink-700">
              برای کمپین‌های شهری، چاپ سازمانی، تابلو، طراحی و اجرای چندمرحله‌ای؛
              اطلاعات اولیه پروژه را ثبت کنید تا جلسه تخصصی هماهنگ شود.
            </p>
            </div>
            <div className="border-2 border-ink-900 bg-ink-900 p-5 text-paper shadow-[6px_6px_0_0_#ff4d12]">
              <p className="text-xs font-black text-goldc">مسیر همکاری سازمانی</p>
              <p className="mt-3 text-xs leading-7 text-paper/70">
                بررسی نیاز ← تماس کارشناس ← جلسه تخصصی ← پیشنهاد فنی و مالی
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-7 px-4 py-12 lg:grid-cols-[1fr_300px]">
          {trackingCode ? (
            <section className="border-2 border-ink-900 bg-white p-8 text-center shadow-[6px_6px_0_0_#141414]">
              <div className="mx-auto grid h-14 w-14 place-items-center border-2 border-ink-900 bg-goldc text-2xl font-black">✓</div>
              <h2 className="mt-5 text-xl font-black text-ink-900">درخواست مشاوره ثبت شد</h2>
              <p className="mt-3 text-sm text-ink-700/70">کد رهگیری:</p>
              <p className="mt-2 font-mono text-2xl font-black text-cyanink" dir="ltr">
                {trackingCode}
              </p>
              <Link
                href="/track"
                className="brut-press mt-6 inline-block border-2 border-ink-900 bg-ink-900 px-6 py-3 text-xs font-bold text-goldc shadow-[4px_4px_0_0_#ff4d12]"
              >
                رهگیری درخواست
              </Link>
            </section>
          ) : (
            <form
              onSubmit={submit}
              className="border-2 border-ink-900 bg-white p-5 shadow-[6px_6px_0_0_#141414] md:p-8"
            >
              <div className="mb-6 flex items-center gap-3 border-b-2 border-ink-900 pb-4">
                <span className="grid h-9 w-9 place-items-center bg-cyanink text-sm font-black text-white">۱</span>
                <h2 className="text-lg font-black text-ink-900">اطلاعات سازمان</h2>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="text-xs font-bold">
                  نام سازمان *
                  <input className={input} required value={form.organizationName} onChange={(e) => update("organizationName", e.target.value)} />
                </label>
                <label className="text-xs font-bold">
                  نوع مجموعه
                  <select className={input} value={form.organizationType} onChange={(e) => update("organizationType", e.target.value)}>
                    <option value="">انتخاب کنید</option>
                    {ORG_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label className="text-xs font-bold">
                  تعداد کارکنان
                  <select className={input} value={form.employeeCount} onChange={(e) => update("employeeCount", e.target.value)}>
                    <option value="">نامشخص</option>
                    <option value="1-20">۱ تا ۲۰ نفر</option>
                    <option value="21-100">۲۱ تا ۱۰۰ نفر</option>
                    <option value="101-500">۱۰۱ تا ۵۰۰ نفر</option>
                    <option value="500+">بیش از ۵۰۰ نفر</option>
                  </select>
                </label>
                <label className="text-xs font-bold">
                  وب‌سایت
                  <input className={input} dir="ltr" type="url" placeholder="https://" value={form.website} onChange={(e) => update("website", e.target.value)} />
                </label>
              </div>

              <div className="mt-8 flex items-center gap-3 border-t-2 border-ink-900/20 pt-6">
                <span className="grid h-9 w-9 place-items-center bg-reg text-sm font-black text-white">۲</span>
                <h2 className="text-lg font-black text-ink-900">نماینده و راه ارتباطی</h2>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="text-xs font-bold">نام نماینده *<input className={input} required value={form.contactName} onChange={(e) => update("contactName", e.target.value)} /></label>
                <label className="text-xs font-bold">شماره موبایل *<input className={input} required dir="ltr" inputMode="numeric" placeholder="09xxxxxxxxx" value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} /></label>
                <label className="text-xs font-bold">ایمیل سازمانی<input className={input} type="email" dir="ltr" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} /></label>
                <label className="text-xs font-bold">روش ترجیحی جلسه<select className={input} value={form.preferredContact} onChange={(e) => update("preferredContact", e.target.value)}><option value="phone">تماس تلفنی</option><option value="online">جلسه آنلاین</option><option value="in_person">جلسه حضوری</option></select></label>
              </div>

              <div className="mt-8 flex items-center gap-3 border-t-2 border-ink-900/20 pt-6">
                <span className="grid h-9 w-9 place-items-center bg-goldc text-sm font-black text-ink-900">۳</span>
                <h2 className="text-lg font-black text-ink-900">اطلاعات پروژه</h2>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="text-xs font-bold md:col-span-2">موضوع پروژه *<input className={input} required placeholder="مثلاً طراحی و اجرای کمپین محیطی شعب" value={form.projectScope} onChange={(e) => update("projectScope", e.target.value)} /></label>
                <label className="text-xs font-bold">بازه بودجه<select className={input} value={form.budgetRange} onChange={(e) => update("budgetRange", e.target.value)}><option value="unknown">نیازمند برآورد</option><option value="under_50">تا ۵۰ میلیون تومان</option><option value="50_150">۵۰ تا ۱۵۰ میلیون</option><option value="150_500">۱۵۰ تا ۵۰۰ میلیون</option><option value="over_500">بیش از ۵۰۰ میلیون</option></select></label>
                <label className="text-xs font-bold">آدرس سازمان<input className={input} value={form.address} onChange={(e) => update("address", e.target.value)} /></label>
                <label className="text-xs font-bold md:col-span-2">اهداف، تعداد شعب یا جزئیات<textarea className={input} rows={5} value={form.goals} onChange={(e) => update("goals", e.target.value)} /></label>
              </div>
              {error && <p className="mt-4 border-2 border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}
              <button disabled={loading} className="brut-press mt-7 w-full border-2 border-ink-900 bg-reg py-3.5 text-sm font-black text-white shadow-[4px_4px_0_0_#141414] disabled:opacity-50">
                {loading ? "در حال ثبت..." : "ثبت درخواست و هماهنگی جلسه"}
              </button>
            </form>
          )}

          <aside className="space-y-4">
            <div className="border-2 border-ink-900 bg-ink-900 p-5 text-paper shadow-[5px_5px_0_0_#c6f432]">
              <h2 className="text-sm font-black text-goldc">پس از ثبت چه می‌شود؟</h2>
              <ol className="mt-5 space-y-4 text-xs leading-6 text-paper/75">
                <li><b className="ml-2 text-goldc">۱.</b>بررسی اولیه نیاز سازمان</li>
                <li><b className="ml-2 text-goldc">۲.</b>هماهنگی جلسه تخصصی</li>
                <li><b className="ml-2 text-goldc">۳.</b>ارائه راهکار و برآورد</li>
              </ol>
            </div>
            <Link href="/request" className="brut-press block border-2 border-ink-900 bg-white p-5 text-xs font-black text-cyanink shadow-[4px_4px_0_0_#141414]">
              سفارش عادی چاپ می‌خواهید؟ ورود به ویزارد سفارش ←
            </Link>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
