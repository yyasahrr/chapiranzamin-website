"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import SiteHeader from "@/components/site-header";
import { readApiResponse } from "@/lib/client-api";

export default function ResetPasswordPage() {
  const pathname = usePathname();
  const adminFlow = pathname.startsWith("/admin/");
  const loginHref = adminFlow ? "/admin/login" : "/login";
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [challengeId, setChallengeId] = useState<number | null>(null);
  const [devCode, setDevCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function requestCode() {
    setLoading(true);
    setError("");
    try {
      const result = await readApiResponse<{
        challengeId: number;
        devCode?: string;
        message?: string;
      }>(
        await fetch("/api/auth/otp/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, purpose: "password_reset" }),
        })
      );
      setChallengeId(result.challengeId);
      setDevCode(result.devCode ?? "");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "ارسال کد ناموفق بود."
      );
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(event: React.FormEvent) {
    event.preventDefault();
    if (!challengeId) return requestCode();
    setLoading(true);
    setError("");
    try {
      await readApiResponse<{ ok: boolean; message?: string }>(
        await fetch("/api/auth/password-reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, password, otpCode, challengeId }),
        })
      );
      setDone(true);
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "تغییر رمز عبور ناموفق بود."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-16">
        <div className="border-2 border-ink-900 bg-white p-8 shadow-[6px_6px_0_0_#141414]">
          {done ? (
            <div className="text-center">
              <div className="text-4xl">✓</div>
              <h1 className="mt-4 text-xl font-black">رمز عبور تغییر کرد</h1>
              <p className="mt-2 text-xs text-slate-500">
                همه نشست‌های قبلی حساب برای امنیت بیشتر باطل شدند.
              </p>
              <Link
                href={loginHref}
                className="mt-6 inline-block border-2 border-ink-900 bg-slate-950 px-6 py-3 text-xs font-bold text-white"
              >
                ورود با رمز جدید
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-center text-xl font-black">بازیابی رمز عبور</h1>
              <p className="mt-2 text-center text-xs leading-6 text-slate-500">
                کد یک‌بارمصرف به شماره موبایل حساب ارسال می‌شود.
              </p>
              <form onSubmit={resetPassword} className="mt-6 space-y-4">
                <label className="block text-xs font-bold">
                  شماره موبایل
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    disabled={Boolean(challengeId)}
                    dir="ltr"
                    inputMode="numeric"
                    required
                    placeholder="09xxxxxxxxx"
                    className="mt-2 w-full rounded-lg border-2 border-ink-900 px-3.5 py-2.5 disabled:bg-slate-100"
                  />
                </label>
                {challengeId && (
                  <>
                    <label className="block text-xs font-bold">
                      کد تأیید
                      <input
                        value={otpCode}
                        onChange={(event) =>
                          setOtpCode(event.target.value.replace(/\D/g, ""))
                        }
                        dir="ltr"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="\d{6}"
                        maxLength={6}
                        required
                        className="mt-2 w-full rounded-lg border-2 border-ink-900 px-3.5 py-3 text-center font-mono text-xl tracking-[.4em]"
                      />
                    </label>
                    <label className="block text-xs font-bold">
                      رمز عبور جدید
                      <input
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        type="password"
                        dir="ltr"
                        minLength={8}
                        required
                        className="mt-2 w-full rounded-lg border-2 border-ink-900 px-3.5 py-2.5"
                      />
                    </label>
                    {devCode && (
                      <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-center text-xs text-amber-800">
                        کد محیط توسعه: <b dir="ltr">{devCode}</b>
                      </p>
                    )}
                  </>
                )}
                {error && (
                  <p className="rounded-md bg-red-50 p-3 text-xs font-bold text-red-700">
                    {error}
                  </p>
                )}
                <button
                  disabled={
                    loading ||
                    !/^09\d{9}$/.test(phone) ||
                    Boolean(
                      challengeId &&
                        (otpCode.length !== 6 || password.length < 8)
                    )
                  }
                  className="w-full border-2 border-ink-900 bg-reg py-3 text-sm font-bold text-white shadow-[4px_4px_0_0_#141414] disabled:opacity-50"
                >
                  {loading
                    ? "در حال پردازش..."
                    : challengeId
                      ? "ثبت رمز عبور جدید"
                      : "دریافت کد بازیابی"}
                </button>
              </form>
              <Link
                href={loginHref}
                className="mt-5 block text-center text-xs font-bold text-cyanink"
              >
                بازگشت به ورود
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
