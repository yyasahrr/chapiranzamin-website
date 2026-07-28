import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

const TIMELINE = [
  ["شروع فعالیت", "راه‌اندازی چاپخانه با تمرکز بر چاپ بنر و خدمات محلی"],
  ["توسعه چاپ صنعتی", "تجهیز به دستگاه‌های چاپ عرض بالا و ورود به پروژه‌های سازمانی"],
  ["تیم نصب و مجوز", "تشکیل تیم نصب حرفه‌ای و واحد پیگیری مجوزهای شهری"],
  ["پلتفرم آنلاین", "راه‌اندازی سامانه ثبت و پیگیری آنلاین درخواست‌های سازمانی"],
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="border-b-4 border-reg bg-ink-900 py-16 text-center text-paper">
        <h1 className="text-4xl"><span className="bg-goldc px-3 text-ink-900">درباره چاپ ایران‌زمین</span></h1>
      </section>
      <section className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-sm leading-8 text-ink-700">
          چاپ ایران‌زمین با سال‌ها تجربه در صنعت چاپ و تبلیغات محیطی، همراه سازمان‌ها،
          شهرداری‌ها، دانشگاه‌ها و کسب‌وکارها در اجرای پروژه‌های تبلیغاتی است. مدل کاری
          ما بر پایه مشاوره تخصصی است؛ به‌جای قیمت‌گذاری خودکار، هر درخواست توسط
          کارشناسان بررسی می‌شود و پیشنهاد فنی و مالی اختصاصی متناسب با نیاز و بودجه
          سازمان ارائه می‌گردد.
        </p>
        <div className="mt-12 space-y-6">
          {TIMELINE.map(([t, d], i) => (
            <div key={t} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-reg text-sm font-black text-white">
                  {(i + 1).toLocaleString("fa-IR")}
                </div>
                {i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-ink-100" />}
              </div>
              <div className="pb-8">
                <h3 className="font-bold text-ink-900">{t}</h3>
                <p className="mt-1 text-sm leading-7 text-ink-700/70">{d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            ["تیم طراحی", "گرافیست‌های متخصص کمپین‌های سازمانی و مناسبتی"],
            ["تیم چاپ", "اپراتورهای چاپ صنعتی با کنترل کیفیت رنگ"],
            ["تیم نصب", "نصب در ارتفاع و اجرای سازه‌های شهری با مجوز کامل"],
          ].map(([t, d]) => (
            <div key={t} className="border-2 border-ink-900 bg-white shadow-[4px_4px_0_0_#141414] p-6 text-center">
              <h3 className="mb-2 font-bold text-cyanink">{t}</h3>
              <p className="text-xs leading-6 text-ink-700/70">{d}</p>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
