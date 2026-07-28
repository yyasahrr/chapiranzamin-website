import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

const GROUPS = [
  {
    title: "تبلیغات محیطی و شهری",
    color: "border-reg",
    items: [
      ["طراحی و اجرای بیلبورد", "بیلبوردهای ۳×۶، عرشه پل و سازه‌های بزرگراهی با پیگیری کامل مجوز"],
      ["بنرهای مناسبتی شهری", "بنرهای اعیاد، مناسبت‌های ملی و مذهبی برای معابر و میادین"],
      ["چاپ و نصب تبلیغات محیطی", "استرابورد، لمپست، پرچم ساحلی و سازه‌های سطح شهر"],
      ["پیگیری مجوز شهرداری", "اخذ و تمدید مجوز اکران در معابر شهری و اماکن عمومی"],
    ],
  },
  {
    title: "چاپ صنعتی و سازمانی",
    color: "border-cyanink",
    items: [
      ["چاپ بنر و فلکس", "چاپ عرض بالا روی وینیل، مش، فلکس و بک‌لایت با دستگاه‌های صنعتی"],
      ["پوستر، بروشور و کاتالوگ", "چاپ افست و دیجیتال محصولات کاغذی سازمانی"],
      ["استیکر و برچسب سازمانی", "استیکرهای شیشه‌ای، خودرویی و شناسه‌های اموال"],
      ["استند، سازه و تابلو", "استند نمایشگاهی، رول‌آپ، لایت‌باکس و تابلو سردر"],
    ],
  },
  {
    title: "طراحی و خدمات تکمیلی",
    color: "border-goldc",
    items: [
      ["طراحی گرافیک کمپین", "هویت بصری، کمپین‌های مناسبتی و طرح‌های اختصاصی سازمانی"],
      ["تیم نصب حرفه‌ای", "نصب در ارتفاع، سازه‌های سنگین و اجرای پروژه‌های شهری"],
      ["مشاوره پروژه‌های سازمانی", "برنامه‌ریزی کمپین تبلیغاتی متناسب با بودجه سازمان"],
      ["سایر خدمات چاپ", "هر نیاز چاپی دیگر — در فرم درخواست توضیح دهید"],
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="border-b-4 border-reg bg-ink-900 py-16 text-center text-paper">
        <h1 className="text-4xl"><span className="bg-goldc px-3 text-ink-900">خدمات چاپ و تبلیغات شهری</span></h1>
        <p className="mx-auto mt-4 max-w-xl px-4 text-sm leading-7 text-paper/70">
          هیچ قیمتی به‌صورت عمومی نمایش داده نمی‌شود؛ هر پروژه پس از بررسی و مشاوره،
          پیشنهاد فنی و مالی اختصاصی دریافت می‌کند.
        </p>
      </section>
      <section className="mx-auto max-w-6xl space-y-12 px-4 py-16">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <h2 className={`mb-6 border-r-4 ${g.color} pr-4 text-xl font-black text-ink-900`}>
              {g.title}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {g.items.map(([t, d]) => (
                <div key={t} className="border-2 border-ink-900 bg-white shadow-[4px_4px_0_0_#141414] p-6">
                  <h3 className="mb-2 font-bold text-ink-900">{t}</h3>
                  <p className="text-sm leading-7 text-ink-700/70">{d}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="text-center">
          <Link
            href="/request"
            className="inline-block brut-press border-2 border-ink-900 bg-reg shadow-[4px_4px_0_0_#141414] px-8 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-reg-dark"
          >
            ثبت درخواست مشاوره رایگان
          </Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
