import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

const PROJECTS = [
  { img: "/images/portfolio-billboard.jpg", title: "بیلبورد بزرگراهی ۳×۶ متر", tag: "بیلبورد", desc: "طراحی، چاپ و اکران بیلبورد کمپین سازمانی با پیگیری مجوز" },
  { img: "/images/portfolio-banner.jpg", title: "بنرهای مناسبتی معابر شهری", tag: "تبلیغات شهری", desc: "چاپ و نصب سری بنرهای مناسبتی برای مبلمان شهری" },
  { img: "/images/portfolio-print.jpg", title: "چاپ صنعتی عرض بالا", tag: "چاپ بنر", desc: "خط چاپ وینیل و فلکس با کیفیت اکوسالونت برای پروژه‌های حجیم" },
  { img: "/images/portfolio-signage.jpg", title: "نصب تابلو سردر سازمانی", tag: "تابلو و سازه", desc: "ساخت و نصب تابلو کامپوزیت و حروف برجسته با تیم نصب در ارتفاع" },
  { img: "/images/hero.jpg", title: "کمپین محیطی شبانه شهری", tag: "کمپین سازمانی", desc: "اجرای کمپین تبلیغات محیطی چند نقطه‌ای در سطح شهر" },
];

export default function PortfolioPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="border-b-4 border-reg bg-ink-900 py-16 text-center text-paper">
        <h1 className="text-4xl"><span className="bg-goldc px-3 text-ink-900">نمونه‌کارها</span></h1>
        <p className="mx-auto mt-4 max-w-xl px-4 text-sm leading-7 text-paper/70">
          گزیده‌ای از پروژه‌های سازمانی، شهری و صنعتی اجراشده توسط تیم چاپ ایران‌زمین.
        </p>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p) => (
            <div key={p.title} className="overflow-hidden border-2 border-ink-900 bg-white shadow-[4px_4px_0_0_#141414]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.img} alt={p.title} className="h-52 w-full object-cover" />
              <div className="p-5">
                <span className="mb-2 inline-block border border-ink-900 bg-cyanink px-3 py-1 text-[11px] font-black text-white">
                  {p.tag}
                </span>
                <h3 className="font-bold text-ink-900">{p.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-700/70">{p.desc}</p>
              </div>
            </div>
          ))}
          <div className="grid place-items-center border-2 border-dashed border-ink-900 p-8 text-center">
            <div>
              <p className="mb-4 text-sm font-bold text-ink-700">
                پروژه بعدی می‌تواند پروژه سازمان شما باشد.
              </p>
              <Link
                href="/request"
                className="inline-block brut-press border-2 border-ink-900 bg-reg shadow-[4px_4px_0_0_#141414] px-6 py-3 text-sm font-bold text-white transition hover:bg-reg-dark"
              >
                شروع همکاری
              </Link>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
