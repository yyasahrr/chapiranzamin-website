import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="border-b-4 border-reg bg-ink-900 py-16 text-center text-paper">
        <h1 className="text-4xl"><span className="bg-goldc px-3 text-ink-900">ارتباط با ما</span></h1>
      </section>
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["📞", "تلفن دفتر", "۰۲۱-۱۲۳۴۵۶۷۸"],
            ["📱", "موبایل و واتس‌اپ", "۰۹۱۲-۰۰۰۰۰۰۰"],
            ["✉️", "ایمیل", "info@chapiranzamin.ir"],
          ].map(([icon, t, v]) => (
            <div key={t} className="border-2 border-ink-900 bg-white shadow-[4px_4px_0_0_#141414] p-6 text-center">
              <div className="mb-3 text-3xl">{icon}</div>
              <h3 className="mb-1 text-sm font-bold text-ink-900">{t}</h3>
              <p className="text-sm text-ink-700/70" dir="ltr">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 border-2 border-ink-900 bg-white shadow-[4px_4px_0_0_#141414] p-8 text-center">
          <h2 className="text-lg font-black text-ink-900">آدرس چاپخانه</h2>
          <p className="mt-3 text-sm leading-7 text-ink-700/70">
            تهران، خیابان انقلاب — ساعت کاری: شنبه تا پنجشنبه، ۸ تا ۱۸
          </p>
          <p className="mt-6 text-sm text-ink-700">
            برای شروع همکاری نیازی به تماس نیست؛ همین حالا درخواست خود را آنلاین ثبت کنید:
          </p>
          <Link
            href="/request"
            className="mt-4 inline-block brut-press border-2 border-ink-900 bg-reg shadow-[4px_4px_0_0_#141414] px-8 py-3.5 text-sm font-bold text-white transition hover:bg-reg-dark"
          >
            ثبت درخواست مشاوره
          </Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
