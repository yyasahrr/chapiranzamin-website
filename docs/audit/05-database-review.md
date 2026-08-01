# 05 — بازبینی دیتابیس

## مدل داده

جداول اصلی: users، sessions، organizations، service_requests،
service_request_items، request_messages، service_catalog، invoices،
notifications، email_campaigns، email_deliveries، app_settings، blog_posts و
schema_migrations.

## یافته‌ها

| شدت | موضوع | وضعیت |
|---|---|---|
| P1 | PGlite filesystem برای serverless/multi-replica مناسب نیست | باز |
| P1 | migration/rollback واقعی وجود ندارد؛ DDL در startup است | باز؛ ledger پایه اضافه شد |
| P1 | backup/restore زمان‌بندی‌شده و آزموده وجود ندارد | باز |
| P1 | قبل از اصلاح، سفارش چندمرحله‌ای transaction نبود | رفع شد |
| P2 | CHECK constraint برای status/role/amount وجود ندارد | باز |
| P2 | `service_id` آیتم FK رسمی به catalog ندارد | باز |
| P2 | سیاست retention نشست/پیام/اعلان کامل نیست | باز |
| P2 | index چند FK پرتکرار کم بود | indexهای request/message/invoice/notification اضافه شد |

PGlite رسماً persistence روی filesystem را پشتیبانی می‌کند
([README رسمی](https://github.com/electric-sql/pglite/blob/main/README.md))،
اما این به‌معنای مناسب‌بودن برای replication، HA یا filesystem موقتی platformهای
serverless نیست.

## consistency و concurrency

- سازمان، سفارش و آیتم‌ها اکنون داخل یک transaction درج می‌شوند.
- tracking code از `crypto.randomInt` ساخته می‌شود و unique index دارد.
- ثبت‌نام علاوه بر pre-check، خطای unique race را به 409 تبدیل می‌کند.
- قیمت و اعداد سقف دارند و overflow/Infinity رد می‌شود.
- limiter و PGlite در چند process مشترک نیستند؛ deploy فعلی باید دقیقاً یک
  process و یک volume پایدار داشته باشد.

## رویه backup/restore پیشنهادی برای beta تک‌نمونه‌ای

1. ورودی write را متوقف و process را graceful shutdown کنید.
2. کل مسیر `PGLITE_DATA_DIR` را با snapshot اتمیک volume کپی کنید.
3. checksum و اندازه snapshot را ثبت و backup را رمزنگاری کنید.
4. snapshot را دوره‌ای در محیط ایزوله با همان نسخه PGlite restore کنید.
5. `/api/health`، شمارش جداول و چند سفارش نمونه را پس از restore کنترل کنید.
6. RPO/RTO، retention و مسئول پاسخ‌گو را ثبت کنید.

در این ممیزی backup واقعی ساخته یا restore نشد؛ بنابراین این مورد blocker است.
هدف production باید PostgreSQL مدیریت‌شده با PITR، migration job و rehearsal
بازیابی باشد.
