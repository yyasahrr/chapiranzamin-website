# PHP Backend — چاپخانه (جدید)

این پوشه یک بک‌اند جداگانه با **PHP خام** (PDO) و **MySQL** برای پروژه‌ی چاپخانه است.

## ساختار پوشه‌ها

```
php-backend/
├── .env.example          # نمونه‌ی متغیرهای محیطی
├── config/
│   ├── config.php         # بارگذاری `.env`
│   └── database.php       # اتصال PDO (MySQL یا SQLite)
├── migrations/            # فایل‌های SQL برای ساخت دیتابیس
│   ├── 00_create_database.sql
│   ├── 01_users.sql
│   ├── 02_sessions.sql
│   ├── 03_organizations.sql
│   ├── 04_service_requests.sql
│   ├── 05_service_request_items.sql
│   ├── 06_request_messages.sql
│   └── sqlite/
│       └── schema.sql     # اسکیمای SQLite برای توسعه (DB_DRIVER=sqlite)
├── scripts/
│   └── bootstrap.php      # ساخت اسکیمای SQLite و بذر اولین مدیر
├── wasm-runner/
│   └── serve.mjs          # سرور توسعه با PHP WASM (بدون نصب PHP/MySQL)
├── public/
│   └── index.php          # روتر اصلی (Front Controller)
└── endpoints/             # روت‌های API
    ├── auth/
    │   ├── register.php
    │   ├── login.php
    │   ├── logout.php
    │   └── me.php
    ├── requests/
    │   ├── index.php      # GET (لیست) / POST (ایجاد)
    │   ├── show.php
    │   ├── update.php
    │   └── messages.php
    ├── track/
    │   └── index.php
    └── admin/
        ├── requests/
        │   ├── index.php  # لیست با فیلتر
        │   ├── show.php
        │   └── update.php
        └── stats.php
```

## اجرای توسعه بدون PHP/MySQL (پیش‌فرض)

از ریشه‌ی مخزن:

```bash
npm run backend
```

این فرمان API را با PHP کامپایل‌شده به WebAssembly اجرا می‌کند و:

1. در اولین اجرا وابستگی‌های `wasm-runner` را نصب می‌کند.
2. اگر `php-backend/.env` وجود نداشته باشد، آن را با `DB_DRIVER=sqlite` و
   حساب مدیر توسعه (`09120000000` / `admin123456`) می‌سازد.
3. اسکیمای SQLite را از `migrations/sqlite/schema.sql` اعمال و اولین مدیر را
   با `scripts/bootstrap.php` بذر می‌کند (موبایل `09120000000`، رمز
   `admin123456`). برای تعریف رمز جدید یا ساخت مدیر دیگر:
   `npm run backend:admin -- <موبایل> <رمز>` (اسکریپت
   `scripts/set-admin-password.php`).
4. API را روی `http://localhost:8080` سرو می‌کند (پورت با `PHP_BACKEND_PORT`
   قابل تغییر است). فایل SQLite در `php-backend/.data/` می‌ماند.

در Next.js کافی است `PHP_API_BASE_URL=http://localhost:8080` باشد تا اتصال
کامل شود.

## راه‌اندازی production با MySQL

۱. MySQL را اجرا کنید و دیتابیس بسازید:

```bash
mysql -u root -p < php-backend/migrations/00_create_database.sql
mysql -u root -p chapiran_php < php-backend/migrations/01_users.sql
mysql -u root -p chapiran_php < php-backend/migrations/02_sessions.sql
mysql -u root -p chapiran_php < php-backend/migrations/03_organizations.sql
mysql -u root -p chapiran_php < php-backend/migrations/04_service_requests.sql
mysql -u root -p chapiran_php < php-backend/migrations/05_service_request_items.sql
mysql -u root -p chapiran_php < php-backend/migrations/06_request_messages.sql
```

۲. فایل `.env` بسازید:

```bash
cp php-backend/.env.example php-backend/.env
```

و مقادیر `DB_DRIVER=mysql`، `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` را
تنظیم کنید. برای ساخت اولین مدیر، `ADMIN_NAME`, `ADMIN_PHONE` و
`ADMIN_PASSWORD` را پر کنید و اجرا کنید:

```bash
php php-backend/scripts/bootstrap.php
```

## اجرا با PHP بومی

روتر داخلی PHP باید همه‌ی مسیرها را به کنترلر اصلی بفرستد:

```bash
php -S localhost:8080 -t php-backend/public php-backend/public/index.php
```

سپس به `http://localhost:8080/api/auth/register` و سایر روت‌ها دسترسی دارید.
حالت SQLite نیز با PHP بومی در دسترس است: `DB_DRIVER=sqlite` و مقدار
`SQLITE_PATH` را در `.env` بگذارید و `bootstrap.php` را یک‌بار اجرا کنید.

## روت‌های اصلی API

| روش | مسیر | توضیح |
|---|---|---|
| GET | `/health` | بررسی سلامت |
| POST | `/api/auth/register` | ثبت‌نام |
| POST | `/api/auth/login` | ورود |
| POST | `/api/auth/logout` | خروج |
| GET | `/api/auth/me` | اطلاعات کاربر جاری |
| POST | `/api/requests` | ایجاد درخواست جدید |
| GET | `/api/requests` | لیست درخواست‌ها (کاربر / ادمین) |
| GET | `/api/requests/{id}` | جزئیات یک درخواست |
| PUT | `/api/requests/{id}` | به‌روزرسانی درخواست |
| POST | `/api/requests/{id}/messages` | ارسال پیام در درخواست |
| POST | `/api/track` | پیگیری با کد پیگیری و شماره موبایل |
| GET | `/api/admin/requests` | مدیریت درخواست‌ها (ادمین) |
| PUT | `/api/admin/requests/{id}` | به‌روزرسانی توسط ادمین |
| GET | `/api/admin/stats` | آمار سیستم |

## نکته

این بک‌اند **کاملاً جدا** از پروژه‌ی Next.js است. در production از دیتابیس
**MySQL** (`chapiran_php`) و در توسعه لوکال می‌تواند از **SQLite**
(`DB_DRIVER=sqlite`) استفاده کند؛ کد endpointها در هر دو حالت یکسان است.
