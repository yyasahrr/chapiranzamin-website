# 02 — بازبینی معماری

## اجزای اصلی

| لایه | فناوری/مسیر | ارزیابی |
|---|---|---|
| UI | Next.js App Router، React، Tailwind | مناسب MVP؛ چند component بسیار بزرگ |
| API | Route Handlerهای `src/app/api` | ساده و قابل‌ردیابی؛ قرارداد schema رسمی ندارد |
| Auth | session دیتابیسی + cookie HttpOnly | پس از اصلاح امن‌تر؛ بدون recovery/MFA |
| Authorization | `src/lib/permissions.ts` + کنترل endpoint | نقش‌های اصلی پوشش دارند |
| Data | Drizzle + PGlite filesystem | مناسب local/beta تک‌نمونه‌ای؛ blocker تولید جدی |
| CMS | `blog_posts` و API محدود | create/list/publish؛ فاقد edit/delete/version |
| Backend جایگزین | PHP/MySQL | disconnected و دارای ریسک در صورت انتشار ناخواسته |

## نقاط قوت

- مرز server/client روشن و queryها parameterized هستند.
- جزئیات سفارش مالکیت کاربر را کنترل می‌کند و یادداشت مدیر به مشتری نشت نمی‌کند.
- محاسبه قیمت سمت server انجام می‌شود و ورودی عددی سقف دارد.
- ثبت سازمان، سفارش و آیتم‌ها transaction شده است.
- مسیرهای admin و dashboard با robots `noindex` محافظت می‌شوند.

## بدهی معماری

1. `src/db/index.ts` هم اتصال، هم DDL، هم seed و هم bootstrap مدیر را انجام
   می‌دهد. جدول ledger اضافه شده، ولی migration واقعی و rollback وجود ندارد.
2. PGlite به یک filesystem پایدار و یک process نیاز دارد؛ برای serverless،
   چند replica و failover مناسب نیست.
3. `admin-module.tsx` چندین domain را در یک component بزرگ ترکیب کرده است.
4. API versioning، OpenAPI/schema و validation library مشترک وجود ندارد.
5. backend PHP و Next دو مدل داده مستقل ایجاد می‌کنند و نباید هم‌زمان deploy
   شوند.

## تصمیم توصیه‌شده

بدون بازنویسی framework، لایه Drizzle حفظ و driver به PostgreSQL مدیریت‌شده
منتقل شود. migrationهای versioned، migration job جدا از startup و rollback
تست‌شده قبل از هر استقرار الزامی است. `php-backend` باید از artifact استقرار
حذف یا رسماً archive شود.

