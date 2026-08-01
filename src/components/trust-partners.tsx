const PARTNER_SECTORS = [
  { mark: "ش", name: "شهرداری‌ها", detail: "پروژه‌های شهری" },
  { mark: "س", name: "سازمان‌های دولتی", detail: "چاپ و اکران سازمانی" },
  { mark: "د", name: "دانشگاه‌ها", detail: "رویداد و اطلاع‌رسانی" },
  { mark: "ص", name: "مجموعه‌های صنعتی", detail: "تابلو و هویت محیطی" },
  { mark: "ف", name: "نهادهای فرهنگی", detail: "کمپین‌های مناسبتی" },
  { mark: "ت", name: "مراکز درمانی", detail: "چاپ و راه‌یابی محیطی" },
  { mark: "خ", name: "کسب‌وکارهای خصوصی", detail: "برندینگ و تبلیغات" },
];

function PartnerCard({ mark, name, detail }: (typeof PARTNER_SECTORS)[number]) {
  return (
    <div className="partner-card flex w-60 shrink-0 items-center gap-3 border border-ink-900/15 bg-white/90 px-4 py-3">
      <span className="partner-mark grid h-10 w-10 shrink-0 place-items-center border border-ink-900/15 bg-paper-dark text-sm font-black text-cyanink">
        {mark}
      </span>
      <span>
        <strong className="block text-xs text-ink-900">{name}</strong>
        <small className="mt-1 block text-[9px] text-ink-700/65">{detail}</small>
      </span>
    </div>
  );
}

export default function TrustPartners() {
  return (
    <section className="trust-section border-b border-ink-900/15 bg-white/65 py-12">
      <div className="mx-auto mb-7 flex max-w-6xl flex-wrap items-end justify-between gap-3 px-4">
        <div>
          <p className="text-[10px] font-black tracking-wide text-cyanink">اعتماد سازمانی</p>
          <h2 className="mt-2 text-2xl text-ink-900">همراه مجموعه‌ها در پروژه‌های واقعی</h2>
          <p className="mt-2 text-xs leading-6 text-ink-700/70">
            تجربه همکاری در طیف متنوعی از پروژه‌های چاپی، محیطی و سازمانی
          </p>
        </div>
        <span className="border border-ink-900/15 bg-paper px-3 py-2 text-[10px] font-bold text-ink-700">
          از طراحی تا تولید و اجرا
        </span>
      </div>

      <div className="partner-marquee overflow-hidden" aria-label="حوزه‌های همکاری سازمانی">
        <div className="partner-track flex w-max gap-3 px-3">
          {[...PARTNER_SECTORS, ...PARTNER_SECTORS].map((partner, index) => (
            <PartnerCard key={`${partner.name}-${index}`} {...partner} />
          ))}
        </div>
      </div>

      <p className="mx-auto mt-5 max-w-6xl px-4 text-center text-[9px] text-ink-700/45">
        لوگو و نام شرکای رسمی پس از دریافت تایید انتشار، در همین بخش جایگزین می‌شود.
      </p>
    </section>
  );
}
