# 09 — Accessibility و SEO

## اصلاحات انجام‌شده

- `lang="fa"` و `dir="rtl"` سراسری موجود است.
- skip link و focus-visible واضح اضافه شد.
- error، global-error و 404 قابل‌فهم اضافه شد.
- تصاویر محتوایی alt و ابعاد دارند؛ لوگوی تزئینی header alt خالی دارد.
- marquee در `prefers-reduced-motion` متوقف می‌شود.
- admin/dashboard/login/register noindex هستند.
- robots در محیط غیرproduction کل crawl را می‌بندد تا preview ایندکس نشود.
- فعال‌شدن index فقط با `SITE_ENV=production` و URL نهایی HTTPS ممکن است.
- sitemap نوشته‌های منتشرشده وبلاگ را داینامیک اضافه می‌کند.
- canonical و metadata مقاله وجود دارد.

## موارد باز

| شدت | مورد |
|---|---|
| P1 عملیاتی | domain نهایی HTTPS و `SITE_ENV=production` هنوز تنظیم/تأیید نشده |
| P2 | تست screen reader و keyboard-only کامل اجرا نشده |
| P2 | contrast همه سه theme با ابزار خودکار سنجیده نشده |
| P2 | structured data برای Organization/LocalBusiness/Article وجود ندارد |
| P2 | OG image اختصاصی و تصویر social کامل نیست |
| P2 | فونت خارجی باید self-host شود |
| P3 | sitemap بزرگ آینده به pagination/index نیاز دارد |

## هشدار محتوا

آمار «سال تجربه/تعداد پروژه/سازمان همکار»، شماره تماس، نام برندها، تصاویر
نمونه‌کار و ادعاهای SLA باید توسط مالک کسب‌وکار تأیید شوند. این ممیزی امکان
راستی‌آزمایی محتوای تجاری را نداشت.

