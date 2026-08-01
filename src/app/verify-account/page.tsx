"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import SiteHeader from "@/components/site-header";
import { readApiResponse } from "@/lib/client-api";

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

function VerificationForm() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [phone, setPhone] = useState("");
  const [verified, setVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [challengeId, setChallengeId] = useState<number | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [emailChallengeId, setEmailChallengeId] = useState<number | null>(null);
  const [emailCode, setEmailCode] = useState("");
  const [emailDevCode, setEmailDevCode] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => readApiResponse<{ user: { phone: string; phoneVerified: boolean; email: string | null; emailVerified: boolean } }>(response))
      .then(({ user }) => {
        setPhone(user.phone);
        setVerified(user.phoneVerified);
        setEmail(user.email ?? "");
        setEmailVerified(user.emailVerified);
      })
      .catch(() => { window.location.href = `/login?next=${encodeURIComponent(`/verify-account?next=${encodeURIComponent(next)}`)}`; })
      .finally(() => setLoading(false));
  }, [next]);

  async function requestCode() {
    setLoading(true);
    setError("");
    try {
      const result = await readApiResponse<{ challengeId: number; devCode?: string }>(
        await fetch("/api/auth/otp/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, purpose: "phone_verification" }),
        })
      );
      setChallengeId(result.challengeId);
      setDevCode(result.devCode ?? "");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "ارسال کد ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  async function confirm(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await readApiResponse(
        await fetch("/api/auth/verification/phone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challengeId, otpCode }),
        })
      );
      setVerified(true);
      setChallengeId(null);
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : "تأیید شماره ناموفق بود.");
      setLoading(false);
    }
  }

  async function requestEmailCode() {
    setEmailLoading(true);
    setEmailError("");
    try {
      const result = await readApiResponse<{ challengeId: number; devCode?: string }>(
        await fetch("/api/auth/verification/email/request", { method: "POST" })
      );
      setEmailChallengeId(result.challengeId);
      setEmailDevCode(result.devCode ?? "");
    } catch (requestError) {
      setEmailError(requestError instanceof Error ? requestError.message : "ارسال کد ایمیل ناموفق بود.");
    } finally {
      setEmailLoading(false);
    }
  }

  async function confirmEmail() {
    setEmailLoading(true);
    setEmailError("");
    try {
      await readApiResponse(
        await fetch("/api/auth/verification/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challengeId: emailChallengeId, otpCode: emailCode }),
        })
      );
      setEmailVerified(true);
      setEmailChallengeId(null);
    } catch (confirmError) {
      setEmailError(confirmError instanceof Error ? confirmError.message : "تأیید ایمیل ناموفق بود.");
    } finally {
      setEmailLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <div className="border-2 border-ink-900 bg-white p-8 shadow-[6px_6px_0_0_#141414]">
        <p className="text-[10px] font-black text-cyanink">تکمیل امنیت حساب</p>
        <h1 className="mt-2 text-xl font-black">تأیید شماره موبایل</h1>
        <p className="mt-3 text-xs leading-6 text-ink-700/65">
          حساب شما ساخته شده است. این مرحله اجباری نیست و هر زمان از داشبورد قابل انجام است.
        </p>
        {verified ? (
          <div className="mt-6">
            <p className="bg-emerald-50 p-4 text-sm font-bold text-emerald-700">شماره موبایل شما تأیید شده است.</p>
          </div>
        ) : challengeId ? (
          <form onSubmit={confirm} className="mt-6 space-y-4">
            <p className="text-xs">کد ارسال‌شده به <b dir="ltr">{phone}</b> را وارد کنید.</p>
            <input dir="ltr" inputMode="numeric" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))} className="w-full border-2 border-ink-900 p-3 text-center font-mono text-xl tracking-[.4em]" />
            {devCode && <p className="bg-amber-50 p-3 text-center text-xs">کد محیط توسعه: <b dir="ltr">{devCode}</b></p>}
            {error && <p className="bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}
            <button disabled={loading || otpCode.length !== 6} className="w-full border-2 border-ink-900 bg-reg p-3 text-sm font-bold text-white disabled:opacity-50">تأیید شماره</button>
          </form>
        ) : (
          <div className="mt-6">
            {error && <p className="mb-3 bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}
            <button type="button" onClick={requestCode} disabled={loading} className="w-full border-2 border-ink-900 bg-reg p-3 text-sm font-bold text-white disabled:opacity-50">
              {loading ? "در حال بررسی..." : "ارسال کد تأیید"}
            </button>
          </div>
        )}
        {email && (
          <div className="mt-7 border-t-2 border-ink-900/10 pt-6">
            <p className="text-[10px] font-black text-cyanink">تأیید ایمیل اختیاری</p>
            <p className="mt-2 text-xs" dir="ltr">{email}</p>
            {emailVerified ? (
              <p className="mt-3 bg-emerald-50 p-3 text-xs font-bold text-emerald-700">ایمیل شما تأیید شده است.</p>
            ) : emailChallengeId ? (
              <div className="mt-3 space-y-3">
                <input dir="ltr" inputMode="numeric" maxLength={6} value={emailCode} onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ""))} className="w-full border-2 border-ink-900 p-3 text-center font-mono tracking-[.4em]" placeholder="------" />
                {emailDevCode && <p className="bg-amber-50 p-2 text-center text-xs">کد محیط توسعه: <b>{emailDevCode}</b></p>}
                <button type="button" onClick={() => void confirmEmail()} disabled={emailLoading || emailCode.length !== 6} className="w-full border-2 border-ink-900 bg-cyanink p-3 text-xs font-bold text-white disabled:opacity-50">تأیید ایمیل</button>
              </div>
            ) : (
              <button type="button" onClick={() => void requestEmailCode()} disabled={emailLoading} className="mt-3 w-full border-2 border-ink-900 bg-white p-3 text-xs font-bold disabled:opacity-50">
                {emailLoading ? "در حال ارسال..." : "ارسال کد به ایمیل"}
              </button>
            )}
            {emailError && <p className="mt-3 bg-red-50 p-3 text-xs font-bold text-red-700">{emailError}</p>}
          </div>
        )}
        <Link href={next} className="mt-5 block border-2 border-ink-900 bg-ink-900 p-3 text-center text-xs font-bold text-white">ادامه به حساب</Link>
      </div>
    </main>
  );
}

export default function VerifyAccountPage() {
  return <div className="min-h-screen"><SiteHeader /><Suspense><VerificationForm /></Suspense></div>;
}
