"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SiteHeader from "@/components/site-header";
import {
  PRIORITY_LABELS,
  REQUEST_TYPE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  formatDate,
} from "@/lib/constants";

type Me = { id: number; name: string; phone: string; role: string };
type Req = {
  id: number;
  trackingCode: string;
  requestType: string;
  status: string;
  priority: string;
  createdAt: string;
  meetingScheduledAt: string | null;
  itemCount: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [requests, setRequests] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) return router.replace("/login");
      const meData = await meRes.json();
      if (meData.user.role === "admin") return router.replace("/admin");
      setMe(meData.user);
      const reqRes = await fetch("/api/requests");
      if (reqRes.ok) {
        const d = await reqRes.json();
        setRequests(d.requests);
      }
      setLoading(false);
    })();
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  if (loading)
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <p className="py-24 text-center text-sm text-ink-700/60">در حال بارگذاری...</p>
      </div>
    );

  const active = requests.filter(
    (r) => !["completed", "cancelled"].includes(r.status)
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-ink-900">سلام، {me?.name} 👋</h1>
            <p className="mt-1 text-xs text-ink-700/70" dir="ltr">{me?.phone}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/request"
              className="brut-press border-2 border-ink-900 bg-reg shadow-[4px_4px_0_0_#141414] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-reg-dark"
            >
              + درخواست جدید
            </Link>
            <button
              onClick={logout}
              className="rounded-xl border-2 border-ink-900 px-5 py-2.5 text-sm font-bold text-ink-700 hover:border-reg hover:text-reg"
            >
              خروج
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            ["کل درخواست‌ها", requests.length],
            ["در جریان", active.length],
            ["تکمیل‌شده", requests.filter((r) => r.status === "completed").length],
          ].map(([t, n]) => (
            <div key={t} className="border-2 border-ink-900 bg-white shadow-[4px_4px_0_0_#141414] p-5 text-center">
              <div className="text-2xl font-black text-cyanink">
                {Number(n).toLocaleString("fa-IR")}
              </div>
              <div className="mt-1 text-xs text-ink-700/70">{t}</div>
            </div>
          ))}
        </div>

        <h2 className="mb-4 mt-10 text-lg font-black text-ink-900">درخواست‌های من</h2>
        {requests.length === 0 ? (
          <div className="border-2 border-dashed border-ink-900 p-12 text-center">
            <p className="text-sm text-ink-700/70">هنوز درخواستی ثبت نکرده‌اید.</p>
            <Link
              href="/request"
              className="mt-4 inline-block brut-press border-2 border-ink-900 bg-reg shadow-[4px_4px_0_0_#141414] px-6 py-3 text-sm font-bold text-white"
            >
              ثبت اولین درخواست
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <Link
                key={r.id}
                href={`/dashboard/requests/${r.id}`}
                className="block border-2 border-ink-900 bg-white shadow-[4px_4px_0_0_#141414] p-5 transition hover:border-cyanink/50 hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-ink-900" dir="ltr">{r.trackingCode}</span>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${STATUS_COLORS[r.status]}`}>
                        {STATUS_LABELS[r.status]}
                      </span>
                      {r.priority !== "normal" && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-[11px] font-bold text-red-800">
                          {PRIORITY_LABELS[r.priority]}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-ink-700/70">
                      {REQUEST_TYPE_LABELS[r.requestType]} • {Number(r.itemCount).toLocaleString("fa-IR")} آیتم
                      • ثبت: {formatDate(r.createdAt)}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-cyanink">مشاهده ←</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
