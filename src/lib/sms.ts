export type OtpPurpose = "phone_verification" | "password_reset";

export async function sendOtpSms({
  phone,
  code,
  purpose,
}: {
  phone: string;
  code: string;
  purpose: OtpPurpose;
}): Promise<{ devCode?: string }> {
  const developmentMode =
    process.env.NODE_ENV !== "production" &&
    process.env.OTP_DEV_MODE !== "false";
  if (developmentMode) return { devCode: code };

  const endpoint = process.env.SMS_WEBHOOK_URL?.trim();
  if (!endpoint) throw new Error("SMS_NOT_CONFIGURED");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.SMS_API_KEY
          ? { Authorization: `Bearer ${process.env.SMS_API_KEY}` }
          : {}),
      },
      body: JSON.stringify({
        to: phone,
        code,
        purpose,
        template: process.env.SMS_OTP_TEMPLATE || "chapiranzamin-otp",
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`SMS_PROVIDER_${response.status}`);
    return {};
  } finally {
    clearTimeout(timeout);
  }
}
