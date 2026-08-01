# 06 — بازبینی API

## سطح API فعال

| Method | Endpoint | Auth | Roles | Validation | Rate Limit | Test | Status |
|---|---|---|---|---|---|---|---|
| GET | `/api/health` | خیر | public | N/A | خیر | Smoke+Load | Pass |
| POST | `/api/auth/login` | خیر | all/staff scope | JSON/length | 8/15m | Smoke | Pass |
| POST | `/api/auth/register` | خیر | customer | phone/password/unique | 5/h | Unit محدود | Partial |
| POST | `/api/auth/logout` | session اختیاری | all | origin | عمومی guard | Security smoke | Pass |
| GET | `/api/auth/me` | session | all | session expiry | خیر | Smoke | Pass |
| GET | `/api/services`, `/api/blog` | خیر | public | active/published query | خیر | Smoke+Load | Pass |
| POST | `/api/requests` | اختیاری | guest/customer | کامل و transaction | 20/h | Unit pricing | Partial |
| GET | `/api/requests` | بله | customer | owner query | خیر | Smoke auth | Pass |
| GET | `/api/requests/:id` | بله | owner/admin/support | id+ownership | خیر | RBAC unit | Pass |
| POST | `/api/requests/:id/messages` | بله | owner/admin/support | id/length/ownership | global guard | RBAC unit | Partial |
| GET | `/api/track` | کد+موبایل | public | required fields | 30/15m | دستی قبلی | Partial |
| GET | `/api/admin/overview` | بله | section roles | section allow-list | خیر | Smoke admin | Pass |
| GET/PATCH | `/api/admin/requests*` | بله | admin؛ support detail | enum/id/date/amount | خیر | Smoke auth محدود | Partial |
| POST/PATCH | `/api/admin/services*` | بله | admin | slug/model/price/id | خیر | ندارد | Partial |
| POST | `/api/admin/users` | بله | admin | role/password/unique | خیر | RBAC unit | Partial |
| GET/POST | `/api/admin/blog` | بله | admin/content | slug/content/unique | خیر | public smoke | Partial |
| GET/POST | `/api/admin/email-campaigns` | بله | admin | consent/length/idempotency/limit | سقف گیرنده | تست SMTP لازم | Partial |
| GET | `/api/dashboard/overview` | بله | customer | ownership/limits | خیر | Smoke لازم | Implemented |
| PATCH | `/api/account/profile` | بله | all | name/email/consent | global guard | Unit لازم | Implemented |
| PATCH | `/api/notifications/:id` | بله | owner | id/ownership | global guard | Unit لازم | Implemented |

## اصلاحات

- JSON خراب با 400 و پاسخ JSON کنترل‌شده پاسخ داده می‌شود.
- clientهای اصلی پاسخ خالی/HTML را بدون crash مدیریت می‌کنند.
- id، enum، مبلغ، تاریخ، طول متن و اندازه بدنه اعتبارسنجی شدند.
- order write transaction شد و قیمت server-authoritative است.
- cache پاسخ session و overview برابر private/no-store است.
- login مدیریتی scope کارکنان را قبل از ساخت session کنترل می‌کند.

## موارد باز

1. OpenAPI و schema مشترک request/response وجود ندارد.
2. pagination همه endpointها استاندارد نیست؛ overview سقف 100 و list سقف 200 دارد.
3. error envelope و correlation ID سراسری نیست.
4. API versioning وجود ندارد.
5. idempotency key برای ایجاد سفارش/پرداخت وجود ندارد.
6. lifecycle کامل invoice، notification، settings و files API ناقص است.
7. endpointهای GET بزرگ overview چند domain را تجمیع می‌کنند و باید شکسته شوند.

## قرارداد خطا

Routeهای اصلاح‌شده از `{ "message": "..." }` با status مناسب استفاده می‌کنند.
بااین‌حال exceptionهای پیش‌بینی‌نشده برخی GETها هنوز ممکن است توسط Next پاسخ
عمومی تولید کنند؛ UI crash نمی‌کند، ولی middleware مرکزی logging/error envelope
برای production لازم است.
