# 08 — گزارش Performance

## اندازه و build

- build نهایی بهینه Next.js در 11.7 ثانیه compile و TypeScript آن در 12.9
  ثانیه تکمیل شد (زمان روی dev host مشترک نوسان داشت).
- CSS تولیدشده حدود 54.7KB است.
- بزرگ‌ترین chunkهای مشاهده‌شده حدود 233KB، 159KB و 113KB هستند
  (اندازه فایل build، نه transfer gzip).
- بزرگ‌ترین asset عمومی لوگو با حدود 61KB است؛ SVGها کوچک‌اند.
- width/height تصاویر اصلی اضافه شد تا CLS کاهش یابد.

## تست هم‌زمانی سبک

محیط: dev server محلی Windows، دیتابیس PGlite جاری، ۶۰ درخواست متناوب
health/services با concurrency=10:

| معیار | نتیجه |
|---|---|
| failure | 0 |
| p50 | 319ms |
| p95 | 388ms |
| max | 436ms |

این benchmark ظرفیت production نیست؛ compile/HMR و سخت‌افزار محلی روی آن اثر
دارند.

## ریسک‌های Performance

- font از Google Fonts با CSS `@import` خارجی دریافت می‌شود؛ وابستگی third-party،
  privacy و render blocking دارد. self-host کردن فونت توصیه می‌شود.
- PGlite/WASM و filesystem تک‌process سقف scale ایجاد می‌کند.
- overview چند domain و subquery شمارش سفارش را تا 100 رکورد یکجا می‌خواند.
- blog و sitemap مستقیماً DB را query می‌کنند و cache strategy رسمی ندارند.
- `admin-module.tsx` بزرگ است و splitting دامنه‌ای می‌تواند bundle/client work را
  کاهش دهد.

Lighthouse/Web Vitals مرورگر واقعی اجرا نشده است. قبل از beta عمومی باید LCP،
CLS، INP و TTFB روی build production و شبکه موبایل اندازه‌گیری شود.
