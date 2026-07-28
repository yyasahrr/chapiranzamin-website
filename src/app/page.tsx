import Link from "next/link";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

const SERVICES = [
  { n: "۰۱", title: "بنر و فلکس مناسبتی", desc: "چاپ بنرهای مناسبتی، مذهبی و شهری با متریال وینیل، مش و فلکس", accent: "bg-reg text-white" },
  { n: "۰۲", title: "بیلبورد و تبلیغات شهری", desc: "طراحی، چاپ و اجرای بیلبورد و سازه‌های تبلیغاتی در معابر شهری", accent: "bg-cyanink text-white" },
  { n: "۰۳", title: "تابلو، استند و سازه", desc: "سردر سازمانی، تابلوهای راهنما، استند نمایشگاهی و لایت‌باکس", accent: "bg-goldc text-ink-900" },
  { n: "۰۴", title: "طراحی گرافیک و کمپین", desc: "طراحی هویت بصری، پوستر، کمپین‌های سازمانی و مناسبتی", accent: "bg-ink-900 text-goldc" },
  { n: "۰۵", title: "پوستر، بروشور و کاتالوگ", desc: "چاپ افست و دیجیتال محصولات کاغذی سازمانی با کیفیت بالا", accent: "bg-cyanink text-white" },
  { n: "۰۶", title: "نصب و پیگیری مجوز", desc: "تیم نصب حرفه‌ای و پیگیری کامل مجوزهای شهرداری و اماکن", accent: "bg-reg text-white" },
];

const STEPS = [
  { n: "۱", t: "ثبت درخواست", d: "فرم درخواست را آنلاین پر کنید؛ بدون نیاز به تماس اولیه" },
  { n: "۲", t: "مشاوره تخصصی", d: "کارشناسان ما تماس می‌گیرند و جلسه مشاوره تنظیم می‌شود" },
  { n: "۳", t: "طراحی و پیشنهاد", d: "طرح اولیه و پیشنهاد فنی متناسب با بودجه سازمان شما" },
  { n: "۴", t: "چاپ و اجرا", d: "چاپ با متریال استاندارد و اجرای دقیق در محل" },
  { n: "۵", t: "تحویل و پشتیبانی", d: "تحویل نهایی، پیگیری مجوز و پشتیبانی پس از اجرا" },
];

const TICKER =
  "چاپ بنر ▪ بیلبورد ▪ تبلیغات مناسبتی ▪ پروژه‌های شهری ▪ طراحی گرافیک ▪ نصب و اجرا ▪ پیگیری مجوز ▪ ";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* تیکر متحرک */}
      <div className="overflow-hidden border-b-2 border-ink-900 bg-ink-900 py-2" dir="ltr">
        <div className="marquee-track">
          <span className="text-sm font-black text-goldc">{TICKER.repeat(4)}</span>
          <span className="text-sm font-black text-goldc">{TICKER.repeat(4)}</span>
        </div>
      </div>

      {/* Hero پوستری */}
      <section className="border-b-2 border-ink-900">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 md:items-center md:py-20">
          <div>
            <p className="mb-5 inline-block border-2 border-ink-900 bg-goldc px-3 py-1 text-xs font-black shadow-[3px_3px_0_0_#141414]">
              ★ مورد اعتماد سازمان‌ها، شهرداری‌ها و کسب‌وکارها
            </p>
            <h1 className="text-5xl leading-[1.25] text-ink-900 md:text-6xl md:leading-[1.2]">
              از یک طرح
              <br />
              تا یک پیام
              <br />
              <span className="inline-block -rotate-1 border-2 border-ink-900 bg-reg px-3 text-paper shadow-[5px_5px_0_0_#141414]">
                در سطح شهر.
              </span>
            </h1>
            <p className="mt-7 max-w-md border-r-4 border-cyanink pr-4 text-sm leading-8 text-ink-700">
              چاپ ایران‌زمین، همراه سازمان‌ها و کسب‌وکارها در طراحی، چاپ و اجرای
              تبلیغات محیطی، بنرهای مناسبتی و پروژه‌های سازمانی؛ از ایده تا نصب و
              پیگیری مجوز.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/request"
                className="brut-press border-2 border-ink-900 bg-reg px-7 py-3.5 text-center text-sm font-black text-white shadow-[5px_5px_0_0_#141414]"
              >
                ثبت درخواست مشاوره ←
              </Link>
              <Link
                href="/portfolio"
                className="brut-press border-2 border-ink-900 bg-paper px-7 py-3.5 text-center text-sm font-black text-ink-900 shadow-[5px_5px_0_0_#141414]"
              >
                مشاهده نمونه‌کارها
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="border-2 border-ink-900 bg-white p-2 shadow-[8px_8px_0_0_#141414]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero.jpg"
                alt="بیلبورد شهری چاپ ایران‌زمین"
                className="h-72 w-full object-cover md:h-96"
              />
              <div className="flex items-center justify-between px-2 py-2 text-[10px] font-black text-ink-700">
                <span>پروژه: اکران شهری شبانه</span>
                <span dir="ltr">CMYK / 720dpi</span>
              </div>
            </div>
            <span className="sticker-rotate absolute -top-4 left-4 border-2 border-ink-900 bg-goldc px-3 py-1.5 text-xs font-black shadow-[3px_3px_0_0_#141414]">
              بدون قیمت خودکار — فقط مشاوره
            </span>
          </div>
        </div>
      </section>

      {/* بلوک‌های آماری */}
      <section className="border-b-2 border-ink-900">
        <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
          {[
            ["+۱۵", "سال تجربه چاپ و تبلیغات", "bg-reg text-white"],
            ["+۸۰۰", "پروژه سازمانی و شهری", "bg-goldc text-ink-900"],
            ["+۱۲۰", "سازمان و نهاد همکار", "bg-cyanink text-white"],
            ["۲۴h", "پاسخ‌گویی به درخواست‌ها", "bg-ink-900 text-goldc"],
          ].map(([n, t, cls], i) => (
            <div
              key={t}
              className={`${cls} border-ink-900 p-6 text-center md:p-8 ${i < 3 ? "border-l-2" : ""} ${i < 2 ? "max-md:border-b-2" : ""}`}
            >
              <div className="text-4xl font-black" dir="ltr">{n}</div>
              <div className="mt-2 text-xs font-bold opacity-90">{t}</div>
            </div>
          ))}
        </div>
      </section>

      {/* خدمات */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl text-ink-900">خدمات چاپ و تبلیغات محیطی</h2>
            <p className="mt-2 text-sm font-bold text-ink-700">
              بدون نمایش قیمت عمومی — هر پروژه پیشنهاد اختصاصی می‌گیرد.
            </p>
          </div>
          <span className="hidden border-2 border-ink-900 bg-white px-3 py-1 text-xs font-black shadow-[3px_3px_0_0_#141414] md:inline-block">
            ۶ سرویس اصلی
          </span>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="brut-press border-2 border-ink-900 bg-white shadow-[5px_5px_0_0_#141414]"
            >
              <div className={`flex items-center justify-between border-b-2 border-ink-900 px-5 py-2 ${s.accent}`}>
                <span className="text-lg font-black">{s.n}</span>
                <span className="text-xs font-black">▪▪▪</span>
              </div>
              <div className="p-5">
                <h3 className="mb-2 text-xl text-ink-900">{s.title}</h3>
                <p className="text-sm leading-7 text-ink-700">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* مراحل همکاری */}
      <section className="border-y-2 border-ink-900 bg-ink-900 py-20 text-paper">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-3 text-center text-4xl text-goldc">مراحل روشن همکاری</h2>
          <p className="mb-12 text-center text-xs font-bold text-paper/60">
            درخواست ← مشاوره ← طراحی ← اجرا ← تحویل
          </p>
          <div className="grid gap-6 md:grid-cols-5">
            {STEPS.map((s) => (
              <div key={s.n} className="border-2 border-paper/30 p-5 text-center transition hover:border-goldc">
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center border-2 border-goldc bg-goldc text-xl font-black text-ink-900">
                  {s.n}
                </div>
                <h3 className="mb-2 text-lg">{s.t}</h3>
                <p className="text-xs leading-6 text-paper/60">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* نمونه‌کار منتخب */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-4xl text-ink-900">پروژه‌های منتخب</h2>
          <Link
            href="/portfolio"
            className="border-b-2 border-reg text-sm font-black text-ink-900 hover:bg-goldc"
          >
            مشاهده همه ←
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["/images/portfolio-billboard.jpg", "بیلبورد بزرگراهی ۳×۶"],
            ["/images/portfolio-banner.jpg", "بنرهای مناسبتی شهری"],
            ["/images/portfolio-print.jpg", "چاپ صنعتی وینیل و فلکس"],
            ["/images/portfolio-signage.jpg", "نصب تابلو سازمانی"],
          ].map(([src, title], i) => (
            <div
              key={title}
              className={`brut-press border-2 border-ink-900 bg-white p-2 shadow-[5px_5px_0_0_#141414] ${i % 2 === 1 ? "md:mt-6" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={title} className="h-48 w-full object-cover" />
              <div className="flex items-center justify-between px-1 pt-2 pb-1">
                <span className="text-xs font-black text-ink-900">{title}</span>
                <span className="text-[10px] font-black text-reg">▪</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA سازمانی */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="border-2 border-ink-900 bg-goldc p-8 shadow-[8px_8px_0_0_#141414] md:p-12">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl text-ink-900">
                همکاری سازمانی و پروژه‌های شهری
              </h2>
              <p className="mt-3 max-w-xl text-sm font-bold leading-7 text-ink-800">
                شهرداری‌ها، دانشگاه‌ها، ادارات و شرکت‌های صنعتی؛ فرم اختصاصی همکاری
                سازمانی را پر کنید تا کارشناسان ما جلسه مشاوره تنظیم کنند.
              </p>
            </div>
            <Link
              href="/request?type=organization"
              className="brut-press shrink-0 border-2 border-ink-900 bg-ink-900 px-7 py-3.5 text-sm font-black text-goldc shadow-[5px_5px_0_0_#ff4d12]"
            >
              درخواست همکاری سازمانی ←
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
