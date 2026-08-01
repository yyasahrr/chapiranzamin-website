# 10 — آمادگی Production

## حکم

**NOT READY FOR PRODUCTION**

کد build می‌شود و جریان حیاتی محلی سالم است، اما سلامت کد با آمادگی عملیاتی
Production یکسان نیست.

## چک‌لیست

| Area | Status | Evidence | Blocking Issue |
|---|---|---|---|
| Build | Pass | `next build` و production runtime smoke | خیر |
| Lint | Pass | ESLint بدون warning | خیر |
| Type check | Pass | `tsc --noEmit` | خیر |
| Unit tests | Pass | 12/12 | پوشش محدود |
| Integration tests | Partial | HTTP smoke واقعی | mutation کامل ندارد |
| E2E tests | Not available | browser runner وجود ندارد | نقش‌ها/viewport تست نشده |
| Security | Fail برای production | P0های فعال رفع؛ SEC-06 و P1 عملیاتی | PHP artifact/audit ناقص |
| Database | Fail | transaction/index اصلاح شد | PGlite و migration/backup |
| Performance | Partial | load smoke و asset اندازه‌گیری شد | Lighthouse/production load ندارد |
| Accessibility | Partial | skip/focus/reduced motion/alt | screen reader/contrast کامل ندارد |
| SEO | Partial | metadata/robots/sitemap | domain HTTPS نهایی لازم |
| Backup | Not ready | runbook نوشته شد | restore اجرا نشده |
| Monitoring | Not ready | health پایه | provider/alert ندارد |
| Deployment | Not ready | build و `next start` موفق | artifact/volume/rollback ندارد |

## متغیرهای ضروری

- `PGLITE_DATA_DIR`: فقط local/beta تک‌نمونه‌ای؛ volume پایدار
- `ADMIN_PHONE`, `ADMIN_PASSWORD`: فقط bootstrap اولین مدیر؛ رمز ۱۲+ و secret
- `ADMIN_NAME`, `ADMIN_EMAIL`: اختیاری
- `NEXT_PUBLIC_SITE_URL`: domain نهایی HTTPS
- `SITE_ENV=production`: فقط بعد از تأیید domain برای index
- `COOKIE_SECURE`: در production بدون توجه به مقدار همیشه Secure است
- `EMAIL_SEND_ENABLED`, `EMAIL_FROM_NAME`, `EMAIL_FROM_ADDRESS`
- `EMAIL_MAX_RECIPIENTS`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`
- `SMTP_USER`, `SMTP_PASSWORD`

## runbook محلی

```powershell
npm install
Copy-Item .env.example .env.local
# ADMIN_PHONE و ADMIN_PASSWORD قوی را در .env.local تنظیم کنید
npm run dev
npm run test:smoke
```

## release gate پیشنهادی

1. PostgreSQL مدیریت‌شده و migration/rollback تست‌شده.
2. backup با restore rehearsal و RPO/RTO مصوب.
3. CI سبز و dependency audit کامل.
4. E2E نقش‌ها، ثبت سفارش، قیمت، پیام و IDOR.
5. error tracking، metrics، uptime check و alert on-call.
6. HTTPS، secret manager، domain، robots و sitemap نهایی.
7. تصمیم رسمی درباره حذف/عدم انتشار `php-backend`.
8. تکمیل یا حذف ماژول‌های نمایشی از scope انتشار.

تا آن زمان فقط توسعه محلی یا beta داخلی تک‌نمونه‌ای با داده غیرحساس پیشنهاد
می‌شود.
