"use client";

import { useState } from "react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import {
  CATEGORY_LABELS,
  REQUEST_TYPE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_ORDER,
  formatDate,
  formatDateTime,
} from "@/lib/constants";

type TrackResult = {
  request: {
    trackingCode: string;
    status: string;
    requestType: string;
    createdAt: string;
    meetingScheduledAt: string | null;
    contactName: string;
  };
  items: { title: string; category: string; quantity: number }[];
};

export default function TrackPage() {
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(
        `/api/track?code=${encodeURIComponent(code)}&phone=${encodeURIComponent(phone)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در رهگیری");
    } finally {
      setLoading(false);
    }
  }

  const activeStatuses = STATUS_ORDER.filter((s) => s !== "cancelled");
  const currentIdx = result ? activeStatuses.indexOf(result.request.status as never) : -1;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-center text-2xl font-black text-ink-900">رهگیری درخواست</h1>
        <p className="mt-2 text-center text-sm text-ink-700/70">
          کد رهگیری و شماره موبایل ثبت‌شده را وارد کنید.
        </p>
        <form onSubmit={submit} className="mt-8 border-2 border-ink-900 bg-white shadow-[6px_6px_0_0_#141414] p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink-700">کد رهگیری</label>
              <input
                className="w-full rounded-lg border-2 border-ink-900 px-3.5 py-2.5 text-sm outline-none focus:border-cyanink"
                dir="ltr" placeholder="CIZ-XXXXXX" value={code}
                onChange={(e) => setCode(e.target.value)} required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink-700">شماره موبایل</label>
              <input
                className="w-full rounded-lg border-2 border-ink-900 px-3.5 py-2.5 text-sm outline-none focus:border-cyanink"
                dir="ltr" placeholder="09xxxxxxxxx" value={phone}
                onChange={(e) => setPhone(e.target.value)} required
              />
            </div>
          </div>
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>
          )}
          <button
            disabled={loading}
            className="mt-5 w-full brut-press border-2 border-ink-900 bg-ink-900 shadow-[4px_4px_0_0_#ff4d12] py-3 text-sm font-bold text-paper transition hover:bg-ink-800 disabled:opacity-60"
          >
            {loading ? "در حال جست‌وجو..." : "رهگیری"}
          </button>
        </form>

        {result && (
          <div className="mt-8 border-2 border-ink-900 bg-white shadow-[6px_6px_0_0_#141414] p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-lg font-black text-ink-900" dir="ltr">
                  {result.request.trackingCode}
                </div>
                <div className="mt-1 text-xs text-ink-700/70">
                  {REQUEST_TYPE_LABELS[result.request.requestType]} — ثبت:{" "}
                  {formatDate(result.request.createdAt)}
                </div>
              </div>
              <span className={`rounded-full px-4 py-1.5 text-xs font-bold ${STATUS_COLORS[result.request.status]}`}>
                {STATUS_LABELS[result.request.status]}
              </span>
            </div>

            {result.request.status !== "cancelled" && (
              <div className="mb-6 space-y-2">
                {activeStatuses.map((s, i) => (
                  <div key={s} className="flex items-center gap-3">
                    <div
                      className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-black ${
                        i <= currentIdx ? "bg-emerald-500 text-white" : "bg-ink-100 text-ink-700/50"
                      }`}
                    >
                      {i <= currentIdx ? "✓" : ""}
                    </div>
                    <span className={`text-xs font-bold ${i <= currentIdx ? "text-ink-900" : "text-ink-700/40"}`}>
                      {STATUS_LABELS[s]}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {result.request.meetingScheduledAt && (
              <div className="mb-4 rounded-xl bg-purple-50 px-4 py-3 text-sm font-bold text-purple-800">
                📅 جلسه مشاوره: {formatDateTime(result.request.meetingScheduledAt)}
              </div>
            )}

            <h3 className="mb-2 text-sm font-black text-ink-900">آیتم‌های درخواست</h3>
            <ul className="space-y-1 text-sm text-ink-700">
              {result.items.map((it, i) => (
                <li key={i}>
                  • {CATEGORY_LABELS[it.category]} — {it.title} × {Number(it.quantity).toLocaleString("fa-IR")}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
