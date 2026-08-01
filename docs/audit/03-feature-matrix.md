# 03 — ماتریس قابلیت‌ها

تعریف وضعیت: «کامل» یعنی جریان اصلی قابل استفاده و تست‌شده؛ «جزئی» یعنی بخشی
واقعی است اما انتظارات کامل محصول را پوشش نمی‌دهد؛ «نمایشی» یعنی backend عملیاتی
ندارد.

| Feature | UI | Backend | Database | Validation | Authorization | Tests | Status |
|---|---|---|---|---|---|---|---|
| صفحات عمومی/RTL | بله | SSR/Static | محتوا عمدتاً کد | N/A | عمومی | Smoke | کامل |
| ثبت‌نام/ورود مشتری | بله | بله | users/sessions | Server | عمومی/session | Unit+Smoke محدود | جزئی |
| ورود مجزای admin | بله | scope کارکنان | users/sessions | Server | staff roles | Smoke واقعی | کامل |
| RBAC | guard در UI | endpoint guard | role | allow-list | چهار نقش | Unit matrix | جزئی؛ E2E همه نقش‌ها ندارد |
| داشبورد مشتری | بله | requests/detail/message | چند جدول سفارش | Server | owner check | Smoke auth محدود | کامل در جریان اصلی |
| ویزارد داینامیک | بله | service config | service_catalog | Client+Server | عمومی/admin config | Unit قیمت | کامل در مدل موجود |
| قیمت‌گذاری | بله | server-authoritative | amount columns | سقف/نوع/overflow | admin قیمت نهایی | 5 Unit | کامل در چهار مدل |
| سفارش/Workflow | بله | create/list/PATCH | request/items/org | Server+transaction | owner/admin/support | Smoke خواندنی | جزئی |
| تیکت/پیام | بله | message endpoint | request_messages | طول/مالکیت | owner/admin/support | RBAC unit | جزئی |
| خدمات | بله | create/PATCH/list | service_catalog | Server | admin | Smoke list | جزئی |
| محصولات | alias خدمات | مدل مستقل ندارد | مدل مستقل ندارد | ندارد | admin UI | ندارد | نمایشی/ناقص |
| کاربران | create/list | create staff/customer | users | Server+unique | admin | RBAC unit | جزئی |
| CRM | جدول پایه | overview section | users/orgs | query limits | admin/support | RBAC unit | جزئی |
| Finance | summary | خواندن invoice | invoices | محدود | admin | ندارد | جزئی/خواندنی |
| Analytics | داده واقعی پایه | overview | requests/invoices | N/A | admin | ندارد | جزئی |
| Notification | نمایش | خواندن محدود | notifications | محدود | role-based | ندارد | جزئی |
| ایمیل همگانی | ساخت/تاریخچه | SMTP + گزارش تحویل | campaigns/deliveries | Server+consent | فقط admin | تست پیکربندی/HTML لازم | پیاده‌سازی‌شده؛ نیازمند SMTP |
| Settings | فقط‌نمایش | API ویرایش ندارد | app_settings seed | ندارد | admin UI | ندارد | غیرفعال |
| File Management | پیام وضعیت | upload ندارد | storage ندارد | ندارد | content/admin UI | ندارد | غیرفعال |
| CMS/Blog | create/list | GET/POST | blog_posts | Server | admin/content | Smoke public | جزئی |
| Search/Filter/CSV | search محلی | global ندارد | index اختصاصی ندارد | محدود | role UI | ندارد | جزئی/غیرفعال |
| SEO | metadata/robots | sitemap SSR | blog_posts | env gate | عمومی/خصوصی | Build+Smoke | جزئی؛ domain لازم |
| Health | N/A | `GET /api/health` | `SELECT 1` | N/A | عمومی | Smoke+Load | کامل پایه |
