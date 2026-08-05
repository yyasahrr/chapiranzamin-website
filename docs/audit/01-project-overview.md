# 01 — نمای کلی پروژه

تاریخ ممیزی: ۳۰ ژوئیهٔ ۲۰۲۶  
Commit مبنا: `e48d843`  
وضعیت مخزن هنگام شروع: دارای تغییرات محلی گسترده و فایل‌های ثبت‌نشده؛ هیچ reset
یا حذف تغییر کاربر انجام نشد.

## هدف سیستم

سامانه فارسی و RTL چاپخانه برای معرفی خدمات، ثبت سفارش و برآورد قیمت،
رهگیری، داشبورد مشتری، تیکت/گفت‌وگو، مدیریت سفارش و خدمات، CRM پایه و CMS وبلاگ.

## مسیر اجرایی فعال

```text
Browser
  -> Next.js 16 App Router (React 19)
     -> Pages + Route Handlers در src/app
        -> Session/RBAC در src/lib
           -> Drizzle ORM
              -> PGlite/WASM روی filesystem در .data/chapiranzamin
```

پوشه `php-backend` یک backend مستقل PHP/MySQL و متصل‌نشده به رابط فعلی است.
این پوشه در scope ممیزی امنیتی دیده شده، ولی بخشی از runtime فعال Next.js نیست.

## سرویس‌ها و زیرساخت‌های خارجی

- تنها dependency زمان اجرا در browser، Google Fonts است.
- Email، Payment، Search service، object storage، Cache، Queue و Background Job
  متصل وجود ندارد.
- Docker و deployment provider نهایی وجود ندارد.
- GitHub Actions به‌عنوان CI حداقلی در این ممیزی اضافه شد.
- monitoring، log aggregation و alerting provider متصل نیست.

## نقش‌ها

| نقش | دسترسی مورد انتظار |
|---|---|
| `customer` | سفارش‌های خود، جزئیات، پیام و داشبورد مشتری |
| `support` | تیکت، سفارش، CRM و اعلان؛ بدون قیمت نهایی/یادداشت داخلی |
| `content_admin` | CMS، وبلاگ، فایل و اعلان |
| `admin` | دسترسی کامل و ایجاد حساب‌های کارکنان |

## جریان‌های حیاتی

1. مهمان یا مشتری خدمت را انتخاب می‌کند؛ فیلدهای ویزارد از تنظیم خدمت نمایش
   داده می‌شوند و قیمت هم در client و هم در server محاسبه می‌شود.
2. سازمان، سفارش و آیتم‌ها در یک transaction ثبت و کد رهگیری تصادفی تولید
   می‌شود.
3. مهمان با کد رهگیری + موبایل و مشتری از داشبورد وضعیت را می‌بیند.
4. مدیر از `/admin/login` وارد می‌شود و سفارش/قیمت/وضعیت را مدیریت می‌کند.
5. پشتیبان سفارش و پیام را می‌بیند؛ مدیر محتوا به CMS محدود است.

## نتیجه اجرایی

- lint، typecheck، ۱۲ تست واحد و build موفق‌اند.
- smoke test واقعی صفحات، health، ورود مدیر، authorization و هدرهای امنیتی موفق
  است.
- تست سبک ۶۰ درخواست با concurrency=10 بدون خطا اجرا شد.
- وضعیت نهایی: **NOT READY FOR PRODUCTION**؛ علت اصلی دیتابیس فایل‌محور، نبود
  migration/rollback و backup/restore اثبات‌شده، نبود monitoring و ناقص‌بودن
  چند ماژول تجاری است.
