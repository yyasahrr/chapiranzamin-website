# 07 — گزارش تست

تاریخ اجرا: ۳۰ ژوئیهٔ ۲۰۲۶

## نتایج

| فرمان/آزمون | نتیجه |
|---|---|
| `npm run lint` | موفق، بدون warning |
| `npm run typecheck` | موفق |
| `npm test` | ۱۵ از ۱۵ موفق |
| `npm run build` | موفق، ۲۰ صفحه static generation |
| production server روی port ایزوله | موفق با دیتابیس in-memory |
| `npm run check` | موفق |
| smoke صفحات عمومی | ۵ مسیر با HTTP 200 |
| health و security headers | موفق |
| admin بدون session | 403 JSON |
| JSON خراب login | 400 JSON |
| mutation با origin مهاجم | 403 |
| ورود مدیر و overview | موفق؛ secret چاپ نشد |
| feature smoke ایمیل/داشبورد | موفق روی DB موقت |
| load smoke | ۶۰ درخواست، concurrency=10، صفر خطا |

## پوشش تست واحد

- fixed، per-item، per-sqm و quote pricing
- تبدیل سانتی‌متر، quantity و ورودی عددی نامعتبر/بزرگ
- ماتریس نقش customer/content/support/admin
- پاسخ API صحیح، خالی، خراب و error message
- اعتبارسنجی تنظیم SMTP و escape محتوای HTML ایمیل

## محدودیت‌ها

- coverage عددی جمع‌آوری نشده است.
- E2E مرورگر واقعی برای همه breakpointها و نقش support/content اجرا نشد.
- ثبت‌نام، پروفایل، رضایت ایمیل و کمپین پیش‌نویس روی دیتابیس in-memory تست شد.
- ارسال واقعی SMTP اجرا نشد، چون credential/provider واقعی در اختیار نبود.
- payment، file upload، settings و invoice flow قابل تست کامل نیستند چون backend
  کامل ندارند.
- race چند process و failover PGlite تست نشده است.
- `npm audit` آنلاین به‌دلیل محدودیت محیط اجرا نشد.

## CI

`.github/workflows/ci.yml` با Node 22، `npm ci`، lint، typecheck، test، build و
audit سطح critical اضافه شد. این workflow در این ممیزی روی GitHub اجرا نشده و
موفقیت آن باید پس از push تأیید شود.
