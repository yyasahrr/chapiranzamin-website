# 04 — ممیزی امنیت

## یافته‌ها و اقدام‌ها

| ID | Severity | Vulnerability | Location | Impact | Evidence | Fix | Status |
|---|---|---|---|---|---|---|---|
| SEC-01 | P0 | credential مدیر ثابت | db/login/README/env example | takeover عمومی | مقدار ثابت و نمایش UI | bootstrap env با رمز ۱۲+ | Fixed |
| SEC-02 | P1 | session token خام در DB | `src/lib/auth.ts` | replay پس از leak | lookup مستقیم token | ذخیره SHA-256 | Fixed |
| SEC-03 | P1 | نبود brute-force limit | auth/track/order API | abuse/DoS | درخواست نامحدود | limiter حافظه‌ای | Fixed پایه |
| SEC-04 | P1 | نبود CSRF-origin guard/headers | همه APIها/config | cross-site/clickjacking | header test اولیه | Proxy+CSP/HSTS | Fixed |
| SEC-05 | P1 | RBAC support ناسازگار و over-response | admin overview/detail | شکست role/افشای داده | UI مجاز، API 403 | section-aware + محدودسازی notes | Fixed |
| SEC-06 | P1 | backend PHP ناامن در صورت deploy | `php-backend` | token/CORS/info leak | CORS `*` و token body | حذف از artifact یا hardening | Open |
| SEC-07 | P2 | reset/verify/MFA/lockout پایدار ندارد | Auth domain | account risk | route/schema ندارد | طراحی lifecycle حساب | Open |
| SEC-08 | P2 | CSP دارای `unsafe-inline` | `next.config.ts` | کاهش دفاع XSS | policy فعلی | nonce/hash | Open |
| SEC-09 | P2 | limiter distributed نیست | `rate-limit.ts` | bypass چند replica | Map در process | Redis/edge limiter | Open |
| SEC-10 | P2 | audit trail ندارد | admin mutations | عدم پاسخ‌گویی | جدول/event ندارد | audit log immutable | Open |

## کنترل‌های تأییدشده

- hash رمز با bcrypt؛ bootstrap جدید cost=12 و حساب‌های جاری cost قبلی را حفظ می‌کنند.
- cookie برابر HttpOnly، SameSite=Lax، path root و در production همیشه Secure.
- queryهای بررسی‌شده Drizzle/PDO parameterized هستند؛ SQL injection مستقیم
  در مسیر فعال مشاهده نشد.
- IDOR جزئیات سفارش با `userId` کنترل می‌شود؛ پشتیبان فقط staff flow و مشتری
  فقط سفارش خود را می‌بیند.
- یادداشت داخلی فقط برای admin برگردانده می‌شود.
- متن وبلاگ به‌صورت React text رندر می‌شود و HTML خام کاربر اجرا نمی‌شود.
- درخواست cross-origin mutating و بدنه API بزرگ‌تر از 1MB رد می‌شود.

## وابستگی‌ها

اجرای آنلاین `npm audit --omit=dev` در محیط ممیزی به‌علت ممنوعیت ارسال metadata
وابستگی‌ها به registry انجام نشد و نباید «موفق» تلقی شود. نسخه نصب‌شده Next
`16.2.12` در زمان ممیزی tag آخر npm بود. advisory رسمی
[GHSA-955p-x3mx-jcvp](https://github.com/vercel/next.js/security/advisories/GHSA-955p-x3mx-jcvp)
نسخه‌های کمتر از `16.2.11` را آسیب‌پذیر می‌داند، بنابراین نسخه جاری برای آن
یافته خاص patch شده است؛ این جایگزین audit کامل نیست. صفحه رسمی
[Next.js advisories](https://github.com/vercel/next.js/security/advisories)
باید در release gate پایش شود.

## OWASP جمع‌بندی

- Access Control: اصلاح‌شده در جریان اصلی، اما E2E نقش‌ها ناقص.
- Cryptographic Failures: secret ثابت حذف و session hash شد؛ secret manager لازم.
- Injection/XSS: ریسک پایین در مسیر فعال؛ CSP نیازمند سخت‌سازی.
- Insecure Design: دیتابیس تک‌فایلی و نبود audit trail ریسک اصلی.
- Misconfiguration: headers اصلاح شد؛ production env و HTTPS هنوز عملیاتی نشده.
- Logging/Monitoring: تنها log ساختاریافته محدود؛ alerting وجود ندارد.
