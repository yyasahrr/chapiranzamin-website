# 11 — کارهای باقی‌مانده

## P1 — blocker پیش از Production

- [ ] انتقال Drizzle از PGlite به PostgreSQL مدیریت‌شده
  - Priority: P1
  - Risk: از دست‌رفتن داده/عدم scale و failover
  - Files: `src/db/index.ts`, deployment config
  - Reason: filesystem و process منفرد
  - Recommended solution: PostgreSQL HA و connection pooling
  - Estimated complexity: Large

- [ ] migration/rollback و restore rehearsal
  - Priority: P1
  - Risk: schema drift و recovery نامطمئن
  - Files: `src/db`, migration directory, CI
  - Reason: DDL فعلی هنگام startup اجرا می‌شود
  - Recommended solution: migration job versioned و staging rehearsal
  - Estimated complexity: Large

- [ ] backup/PITR، monitoring و alerting عملیاتی
  - Priority: P1
  - Risk: عدم تشخیص incident و recovery
  - Files: deployment/runbooks
  - Reason: provider متصل نیست
  - Recommended solution: encrypted backup، restore drill، error/uptime/DB alerts
  - Estimated complexity: Medium

- [ ] E2E چهار نقش، IDOR، race و session lifecycle
  - Priority: P1
  - Risk: regression دسترسی
  - Files: `tests/e2e`, CI
  - Reason: فقط unit و HTTP smoke محدود موجود است
  - Recommended solution: Playwright روی staging با fixture ایزوله
  - Estimated complexity: Large

- [ ] dependency audit کامل و تعیین تکلیف backend PHP
  - Priority: P1
  - Risk: vulnerable component یا expose ناخواسته PHP
  - Files: lockfile, `php-backend`, deployment artifact
  - Reason: audit آنلاین مجاز نشد و PHP hardening نشده
  - Recommended solution: registry audit در CI؛ حذف PHP از artifact یا hardening
  - Estimated complexity: Medium

- [ ] تعیین scope ماژول‌های file/finance/settings/products
  - Priority: P1
  - Risk: انتشار قابلیت ناقص
  - Files: admin modules و API/schemaهای مربوط
  - Reason: برخی بخش‌ها backend کامل ندارند
  - Recommended solution: تکمیل با acceptance criteria یا حذف از release scope
  - Estimated complexity: Large

## P2 — کیفیت و امنیت beta

- [ ] انتقال ارسال ایمیل همگانی به Queue و worker
  - Priority: P2
  - Risk: timeout درخواست برای فهرست بزرگ یا SMTP کند
  - Files: email campaign API، worker و deployment
  - Reason: ارسال فعلی در batchهای سه‌تایی داخل request انجام می‌شود
  - Recommended solution: queue پایدار، retry محدود و suppression/bounce list
  - Estimated complexity: Medium

- [ ] تکمیل lifecycle حساب و کنترل‌های امنیتی
  - Priority: P2
  - Risk: بازیابی حساب و abuse
  - Files: auth routes/schema/UI
  - Reason: reset/verification/MFA/distributed limiter/audit log موجود نیست
  - Recommended solution: flowهای token یک‌بارمصرف، MFA مدیر، Redis limiter و audit
  - Estimated complexity: Large

- [ ] استانداردسازی API و data integrity
  - Priority: P2
  - Risk: خطای قرارداد و داده ناسازگار
  - Files: API routes، schema، migrations
  - Reason: OpenAPI/correlation ID/CHECK/FK/pagination کامل نیست
  - Recommended solution: schema مشترک، error envelope و constraints
  - Estimated complexity: Large

- [ ] تکمیل CMS، invoice/payment و file storage امن
  - Priority: P2
  - Risk: جریان‌های کسب‌وکار ناقص
  - Files: domainهای CMS/finance/files
  - Reason: lifecycle کامل پیاده نشده
  - Recommended solution: idempotency، signed URL، MIME/magic scan و versioning
  - Estimated complexity: Large

- [ ] performance/accessibility/SEO مرورگر واقعی
  - Priority: P2
  - Risk: تجربه موبایل و crawl نامطمئن
  - Files: UI/CSS/metadata
  - Reason: Lighthouse، screen reader و contrast کامل اجرا نشده
  - Recommended solution: self-host font، بودجه Web Vitals و WCAG test
  - Estimated complexity: Medium

## P3 — بهبود محصول

- [ ] CRM، notification، search و refactor admin
  - Priority: P3
  - Risk: نگهداری و عمق محصول
  - Files: `admin-module.tsx` و domainهای جدید
  - Reason: component بزرگ و قابلیت‌های پایه
  - Recommended solution: تفکیک domain، pipeline CRM و search index
  - Estimated complexity: Large

## اصلاحات همین ممیزی

رمز پیش‌فرض حذف شد؛ bootstrap امن مدیر، hash نشست، Secure cookie، rate limit،
cross-site guard، اندازه بدنه، security headers، RBAC پشتیبان، data minimization،
transaction سفارش، validation قیمت/عدد/تاریخ/متن، indexهای DB، مدیریت پاسخ خراب،
error/404، skip link، SEO gating، sitemap وبلاگ، CI، unit/smoke/load tests و
مستندات اضافه شدند. کنترل‌های نمایشی بدون backend غیرفعال و آمارهای ساختگی
داشبورد با داده واقعی جایگزین شدند.
