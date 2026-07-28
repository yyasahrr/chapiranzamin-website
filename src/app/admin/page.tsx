"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  PRIORITY_LABELS,
  REQUEST_TYPE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_ORDER,
  formatDate,
} from "@/lib/constants";

type Stats = {
  byStatus: { status: string; count: number }[];
  totalRequests: number;
  customerCount: number;
  organizationCount: number;
};

type Row = {
  id: number;
  trackingCode: string;
  contactName: string;
  contactPhone: string;
  requestType: string;
  status: string;
  priority: string;
  createdAt: string;
  organizationName: string | null;
  itemCount: number;
};

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    const res = await fetch(`/api/admin/requests?${params}`);
    if (res.ok) setRows((await res.json()).requests);
  }, [status, q]);

  useEffect(() => {
    (async () => {
      const me = await fetch("/api/auth/me");
      if (!me.ok) return router.replace("/login");
      const d = await me.json();
      if (d.user.role !== "admin") return router.replace("/dashboard");
      const s = await fetch("/api/admin/stats");
      if (s.ok) setStats(await s.json());
      setLoading(false);
    })();
  }, [router]);

  useEffect(() => {
    if (!loading) loadRequests();
  }, [loading, loadRequests]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  if (loading)
    return <p className="py-24 text-center text-sm text-ink-700/60">در حال بارگذاری...</p>;

  const statusCount = (s: string) =>
    stats?.byStatus.find((x) => x.status === s)?.count ?? 0;

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink-900/30 bg-ink-900 text-paper">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-reg text-lg font-black">چ</span>
            <span className="font-extrabold">پنل مدیریت چاپ ایران‌زمین</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-paper/70 hover:text-white">نمایش سایت</Link>
            <button onClick={logout} className="rounded-lg border border-paper/30 px-4 py-2 text-sm font-bold hover:bg-paper hover:text-ink-900">
              خروج
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* آمار */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {[
            ["کل درخواست‌ها", stats?.totalRequests ?? 0, "text-ink-900"],
            ["جدید", statusCount("new"), "text-blue-600"],
            ["در حال بررسی", statusCount("under_review"), "text-amber-600"],
            ["قرارداد بسته شد", statusCount("contracted"), "text-emerald-600"],
            ["مشتریان", stats?.customerCount ?? 0, "text-cyanink"],
            ["سازمان‌ها", stats?.organizationCount ?? 0, "text-goldc-dark"],
          ].map(([t, n, c]) => (
            <div key={t as string} className="border-2 border-ink-900 bg-white shadow-[4px_4px_0_0_#141414] p-4 text-center">
              <div className={`text-2xl font-black ${c}`}>{Number(n).toLocaleString("fa-IR")}</div>
              <div className="mt-1 text-[11px] text-ink-700/70">{t}</div>
            </div>
          ))}
        </div>

        {/* فیلترها */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جست‌وجو: کد رهگیری، نام یا موبایل..."
            className="flex-1 rounded-xl border-2 border-ink-900 bg-white px-4 py-2.5 text-sm outline-none focus:border-cyanink"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border-2 border-ink-900 bg-white px-4 py-2.5 text-sm outline-none"
          >
            <option value="">همه وضعیت‌ها</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        {/* جدول دسکتاپ */}
        <div className="mt-5 hidden overflow-hidden border-2 border-ink-900 bg-white shadow-[4px_4px_0_0_#141414] md:block">
          <table className="w-full text-sm">
            <thead className="bg-paper-dark text-xs text-ink-700">
              <tr>
                <th className="px-4 py-3 text-right">کد رهگیری</th>
                <th className="px-4 py-3 text-right">متقاضی</th>
                <th className="px-4 py-3 text-right">نوع</th>
                <th className="px-4 py-3 text-right">آیتم‌ها</th>
                <th className="px-4 py-3 text-right">وضعیت</th>
                <th className="px-4 py-3 text-right">اولویت</th>
                <th className="px-4 py-3 text-right">تاریخ</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-ink-900/15 hover:bg-paper/60">
                  <td className="px-4 py-3 font-bold" dir="ltr">{r.trackingCode}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold">{r.contactName}</div>
                    <div className="text-xs text-ink-700/60" dir="ltr">{r.contactPhone}</div>
                    {r.organizationName && (
                      <div className="text-xs text-cyanink">{r.organizationName}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">{REQUEST_TYPE_LABELS[r.requestType]}</td>
                  <td className="px-4 py-3">{Number(r.itemCount).toLocaleString("fa-IR")}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${STATUS_COLORS[r.status]}`}>
                      {STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{PRIORITY_LABELS[r.priority]}</td>
                  <td className="px-4 py-3 text-xs">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/requests/${r.id}`} className="font-bold text-cyanink hover:text-reg">
                      مدیریت
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-ink-700/50">
                    درخواستی یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* کارت موبایل */}
        <div className="mt-5 space-y-3 md:hidden">
          {rows.map((r) => (
            <Link
              key={r.id}
              href={`/admin/requests/${r.id}`}
              className="block border-2 border-ink-900 bg-white shadow-[4px_4px_0_0_#141414] p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-black" dir="ltr">{r.trackingCode}</span>
                <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${STATUS_COLORS[r.status]}`}>
                  {STATUS_LABELS[r.status]}
                </span>
              </div>
              <div className="mt-2 text-xs text-ink-700/70">
                {r.contactName} • {REQUEST_TYPE_LABELS[r.requestType]} • {formatDate(r.createdAt)}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
