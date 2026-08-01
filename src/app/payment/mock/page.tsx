import SiteHeader from "@/components/site-header";

export default async function MockPaymentPage() {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-16">
        <div className="border-2 border-ink-900 bg-white p-8 shadow-[6px_6px_0_0_#141414]">
          <p className="text-[10px] font-black text-reg">درگاه آزمایشی غیرفعال</p>
          <h1 className="mt-2 text-xl font-black">پرداخت از این محیط پشتیبانی نمی‌شود</h1>
          <p className="mt-5 text-sm leading-7 text-ink-700">
            نسخه Vercel فرانت‌اند دیگر پرداخت محلی مبتنی بر دیتابیس داخلی Next.js
            را اجرا نمی‌کند. درگاه پرداخت باید از سمت بک‌اند PHP یا سرویس پرداخت
            اصلی شما مدیریت شود.
          </p>
        </div>
      </main>
    </div>
  );
}
