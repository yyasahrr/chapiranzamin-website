# PHP Backend — چاپ ایران‌زمین (جدید)

این پوشه یک بک‌اند جداگانه با **PHP خام** (PDO) و **MySQL** برای پروژه‌ی چاپ ایران‌زمین است.

## ساختار پوشه‌ها

```
php-backend/
├── .env.example          # نمونه‌ی متغیرهای محیطی
├── config/
│   ├── config.php         # بارگذاری `.env`
│   └── database.php       # اتصال PDO به MySQL
├── migrations/            # فایل‌های SQL برای ساخت دیتابیس
│   ├── 00_create_database.sql
│   ├── 01_users.sql
│   ├── 02_sessions.sql
│   ├── 03_organizations.sql
│   ├── 04_service_requests.sql
│   ├── 05_service_request_items.sql
│   └── 06_request_messages.sql
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

## راه‌اندازی دیتابیس

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

و مقادیر `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` را تنظیم کنید.

## اجرا

با PHP داخلی:

```bash
cd php-backend/public
php -S localhost:8000
```

سپس به `http://localhost:8000/api/auth/register` و سایر روت‌ها دسترسی دارید.

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

این بک‌اند **کاملاً جدا** از پروژه‌ی Next.js است و از دیتابیس **MySQL جدید** (`chapiran_php`) استفاده می‌کند.
