import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t-4 border-reg bg-ink-900 text-paper">
      {/* وردمارک بزرگ پوستری */}
      <div className="overflow-hidden border-b border-white/10 py-6">
        <p
          className="text-center text-5xl font-black text-transparent md:text-7xl"
          style={{ WebkitTextStroke: "1px rgba(198,244,50,0.5)" }}
        >
          چاپ ایران‌زمین
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center border-2 border-goldc bg-reg text-xl font-black text-white">
              چ
            </span>
            <span className="text-lg font-black">چاپ ایران‌زمین</span>
          </div>
          <p className="max-w-md border-r-4 border-goldc pr-4 text-sm leading-7 text-paper/70">
            همراه سازمان‌ها و کسب‌وکارها در طراحی، چاپ و اجرای تبلیغات محیطی،
            بنرهای مناسبتی و پروژه‌های سازمانی و شهری؛ از ایده و طراحی تا چاپ،
            نصب و پیگیری مجوز.
          </p>
        </div>
        <div>
          <h4 className="mb-4 inline-block bg-goldc px-2 py-0.5 text-sm font-black text-ink-900">
            دسترسی سریع
          </h4>
          <ul className="space-y-2 text-sm text-paper/70">
            <li><Link href="/services" className="hover:text-goldc">▪ خدمات</Link></li>
            <li><Link href="/portfolio" className="hover:text-goldc">▪ نمونه‌کارها</Link></li>
            <li><Link href="/request" className="hover:text-goldc">▪ ثبت سفارش</Link></li>
            <li><Link href="/organization-consultation" className="hover:text-goldc">▪ همکاری سازمانی</Link></li>
            <li><Link href="/track" className="hover:text-goldc">▪ رهگیری درخواست</Link></li>
          </ul>
          <div className="mt-5 flex gap-2" aria-label="شبکه‌های اجتماعی">
            {[
              ["اینستاگرام", process.env.NEXT_PUBLIC_INSTAGRAM_URL],
              ["تلگرام", process.env.NEXT_PUBLIC_TELEGRAM_URL],
              ["لینکدین", process.env.NEXT_PUBLIC_LINKEDIN_URL],
            ].filter((item): item is [string, string] => Boolean(item[1])).map(([label, href]) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                className="grid h-9 min-w-9 place-items-center border border-paper/40 px-2 text-[10px] font-black hover:border-goldc hover:text-goldc">
                {label.slice(0, 2)}
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-4 inline-block bg-goldc px-2 py-0.5 text-sm font-black text-ink-900">
            ارتباط با ما
          </h4>
          <ul className="space-y-2 text-sm text-paper/70">
            <li>تلفن: ۰۲۱-۱۲۳۴۵۶۷۸</li>
            <li>موبایل: ۰۹۱۲-۰۰۰۰۰۰۰</li>
            <li>ایمیل: info@chapiranzamin.ir</li>
            <li>تهران، خیابان انقلاب</li>
          </ul>
        </div>
      </div>
      <div className="border-t-2 border-goldc bg-goldc py-3 text-center text-xs font-black text-ink-900">
        © چاپ ایران‌زمین — تمامی حقوق محفوظ است ▪ چاپ ▪ تبلیغات ▪ اجرا
      </div>
    </footer>
  );
}
