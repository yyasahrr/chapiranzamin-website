import nodemailer from "nodemailer";

export type EmailRecipient = {
  email: string;
  name?: string | null;
};

type EmailConfiguration = {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  password?: string;
  fromEmail: string;
  fromName: string;
};

const globalForEmail = globalThis as typeof globalThis & {
  __chapIranMailer?: nodemailer.Transporter;
};

export function getEmailConfiguration(): EmailConfiguration | null {
  const host = process.env.SMTP_HOST?.trim();
  const fromEmail = process.env.EMAIL_FROM_ADDRESS?.trim();
  const port = Number(process.env.SMTP_PORT || "587");
  if (
    process.env.EMAIL_SEND_ENABLED !== "true" ||
    !host ||
    !fromEmail ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65_535
  ) {
    return null;
  }

  return {
    host,
    port,
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER?.trim() || undefined,
    password: process.env.SMTP_PASSWORD || undefined,
    fromEmail,
    fromName: process.env.EMAIL_FROM_NAME?.trim() || "چاپخانه",
  };
}

export function isEmailConfigured(): boolean {
  return getEmailConfiguration() !== null;
}

function getTransporter(configuration: EmailConfiguration) {
  if (globalForEmail.__chapIranMailer) return globalForEmail.__chapIranMailer;
  const transporter = nodemailer.createTransport({
    host: configuration.host,
    port: configuration.port,
    secure: configuration.secure,
    auth:
      configuration.user && configuration.password
        ? {
            user: configuration.user,
            pass: configuration.password,
          }
        : undefined,
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 30_000,
  });
  globalForEmail.__chapIranMailer = transporter;
  return transporter;
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] || character
  );
}

export function renderCampaignHtml(subject: string, body: string): string {
  const safeSubject = escapeHtml(subject);
  const safeBody = escapeHtml(body).replace(/\r?\n/g, "<br />");
  let baseUrl = "http://localhost:3000";
  try {
    baseUrl = new URL(
      process.env.NEXT_PUBLIC_SITE_URL || baseUrl
    ).toString().replace(/\/$/, "");
  } catch {}
  const preferencesUrl = `${baseUrl}/dashboard`;
  return `<!doctype html>
<html lang="fa" dir="rtl">
  <body style="margin:0;background:#f7f8fa;font-family:Tahoma,Arial,sans-serif;color:#0f172a">
    <div style="max-width:640px;margin:0 auto;padding:32px 16px">
      <div style="background:#0f172a;color:#fff;padding:18px 24px;font-weight:700">چاپخانه</div>
      <div style="background:#fff;border:1px solid #e2e8f0;padding:28px 24px">
        <h1 style="font-size:20px;margin:0 0 18px">${safeSubject}</h1>
        <div style="font-size:14px;line-height:2">${safeBody}</div>
      </div>
      <p style="color:#64748b;font-size:11px;line-height:1.8;text-align:center">
        این پیام از سامانه چاپخانه ارسال شده است.<br />
        مدیریت دریافت ایمیل از <a href="${preferencesUrl}">تنظیمات حساب کاربری</a>
      </p>
    </div>
  </body>
</html>`;
}

export async function sendCampaignEmail({
  recipient,
  subject,
  body,
}: {
  recipient: EmailRecipient;
  subject: string;
  body: string;
}) {
  const configuration = getEmailConfiguration();
  if (!configuration) throw new Error("EMAIL_NOT_CONFIGURED");

  const cleanSubject = subject.replace(/[\r\n]+/g, " ").trim();
  return getTransporter(configuration).sendMail({
    from: {
      name: configuration.fromName,
      address: configuration.fromEmail,
    },
    to: {
      name: recipient.name?.trim() || recipient.email,
      address: recipient.email,
    },
    subject: cleanSubject,
    text: body,
    html: renderCampaignHtml(cleanSubject, body),
  });
}

export async function sendVerificationEmail({
  email,
  code,
}: {
  email: string;
  code: string;
}): Promise<{ devCode?: string }> {
  const developmentMode =
    process.env.NODE_ENV !== "production" &&
    process.env.OTP_DEV_MODE !== "false";
  if (developmentMode) return { devCode: code };
  const configuration = getEmailConfiguration();
  if (!configuration) throw new Error("EMAIL_NOT_CONFIGURED");
  return getTransporter(configuration)
    .sendMail({
      from: { name: configuration.fromName, address: configuration.fromEmail },
      to: email,
      subject: "کد تأیید ایمیل چاپخانه",
      text: `کد تأیید شما: ${code}`,
      html: renderCampaignHtml("تأیید ایمیل", `کد تأیید شما: ${code}`),
    })
    .then(() => ({}));
}
