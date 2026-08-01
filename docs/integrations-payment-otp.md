# اتصال OTP، پیامک و درگاه پرداخت

## پیامک و OTP

ساخت حساب به OTP وابسته نیست. کاربر بعد از ثبت‌نام می‌تواند شماره یا ایمیل خود را
در `/verify-account` تأیید کند.

برای اتصال سرویس پیامک، متغیرهای زیر تنظیم می‌شوند:

```env
OTP_SECRET=a-random-secret-with-at-least-32-characters
OTP_DEV_MODE=false
SMS_WEBHOOK_URL=https://sms-adapter.example/send
SMS_API_KEY=
SMS_OTP_TEMPLATE=chapiranzamin_otp
```

وب‌هوک پیامک درخواست `POST` با بدنه زیر دریافت می‌کند:

```json
{
  "to": "09123456789",
  "code": "123456",
  "purpose": "phone_verification",
  "template": "chapiranzamin_otp"
}
```

تأیید ایمیل از تنظیمات SMTP موجود استفاده می‌کند. کدها در دیتابیس به‌صورت HMAC
ذخیره می‌شوند، مصرف یک‌باره دارند، پنج دقیقه معتبرند و تعداد تلاش و ارسال محدود است.

## درگاه پرداخت

در توسعه، آداپتور `mock` فعال است. برای اتصال درگاه واقعی:

```env
PAYMENT_PROVIDER=webhook
PAYMENT_CREATE_URL=https://payment-adapter.example/create
PAYMENT_VERIFY_URL=https://payment-adapter.example/verify
PAYMENT_API_KEY=
```

آداپتور create این ورودی را دریافت می‌کند:

```json
{
  "amount": 125000,
  "invoiceId": 42,
  "callbackUrl": "https://site.example/api/payments/callback"
}
```

و باید این خروجی را برگرداند:

```json
{
  "authority": "provider-authority",
  "redirectUrl": "https://gateway.example/start/provider-authority"
}
```

آداپتور verify ورودی `authority` و `amount` را دریافت و خروجی زیر را برمی‌گرداند:

```json
{
  "ok": true,
  "referenceId": "bank-reference-id"
}
```

مبلغ پرداخت از فاکتور سمت سرور خوانده می‌شود. ساخت پرداخت فقط برای مالک فاکتور
مجاز است و callback با authority ذخیره‌شده تطبیق داده می‌شود.
