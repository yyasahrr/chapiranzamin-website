"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { STATUS_LABELS, formatDate } from "@/lib/constants";
import { readApiResponse } from "@/lib/client-api";

type Overview = {
  metrics: { users: number; openOrders: number; tickets: number; revenue: number };
  requests: {
    id: number;
    trackingCode: string;
    contactName: string;
    status: string;
    priority: string;
    createdAt: string;
  }[];
  services: { id: number; name: string; active: boolean }[];
};

const money = (value: number) => `${value.toLocaleString("fa-IR")} تومان`;

export default function AdminPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/overview", { cache: "no-store" })
      .then((response) => readApiResponse<Overview & { message?: string }>(response))
      .then(setData)
      .catch(() => setError("اطلاعات داشبورد دریافت نشد؛ صفحه را تازه‌سازی کنید."));
  }, []);

  const metrics = [
    ["درآمد وصول‌شده", money(data?.metrics.revenue ?? 0), "فاکتورهای پرداخت‌شده", "text-emerald-600"],
    ["سفارش‌های فعال", (data?.metrics.openOrders ?? 0).toLocaleString("fa-IR"), "در خط تولید", "text-violet-600"],
    ["کل درخواست‌ها", (data?.metrics.tickets ?? 0).toLocaleString("fa-IR"), "ثبت‌شده در سامانه", "text-amber-600"],
    ["مشتریان", (data?.metrics.users ?? 0).toLocaleString("fa-IR"), "حساب فعال", "text-cyan-600"],
  ];
  const requests = data?.requests ?? [];
  const primaryStatuses = [
    ["new", "جدید", "#7c3aed"],
    ["under_review", "بررسی", "#06b6d4"],
    ["in_production", "تولید", "#f59e0b"],
    ["completed", "تکمیل", "#10b981"],
    ["cancelled", "لغو", "#ef4444"],
  ].map(([key, label, color]) => ({
    key,
    label,
    color,
    count: requests.filter((request) => request.status === key).length,
  }));
  const primaryStatusKeys = new Set(primaryStatuses.map((item) => item.key));
  const statusChart = [
    ...primaryStatuses,
    {
      key: "other",
      label: "سایر مراحل",
      color: "#94a3b8",
      count: requests.filter((request) => !primaryStatusKeys.has(request.status)).length,
    },
  ];
  const chartTotal = Math.max(1, statusChart.reduce((sum, item) => sum + item.count, 0));
  let donutCursor = 0;
  const donutGradient = statusChart
    .map((item) => {
      const start = donutCursor;
      donutCursor += (item.count / chartTotal) * 100;
      return `${item.color} ${start}% ${donutCursor}%`;
    })
    .join(", ");
  const dailyOrders = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - offset));
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    return {
      label: new Intl.DateTimeFormat("fa-IR", { weekday: "narrow" }).format(date),
      count: requests.filter((request) => {
        const created = new Date(request.createdAt);
        return created >= date && created < next;
      }).length,
    };
  });
  const maxDaily = Math.max(1, ...dailyOrders.map((item) => item.count));
  const linePoints = dailyOrders
    .map((item, index) => `${index * 50 + 10},${105 - (item.count / maxDaily) * 80}`)
    .join(" ");
  const priorities = [
    ["عادی", requests.filter((item) => !["high", "urgent"].includes(item.priority)).length, "#64748b"],
    ["بالا", requests.filter((item) => item.priority === "high").length, "#f59e0b"],
    ["فوری", requests.filter((item) => item.priority === "urgent").length, "#ef4444"],
  ] as const;
  const maxPriority = Math.max(1, ...priorities.map((item) => item[1]));

  return (
    <div className="mx-auto max-w-[1500px]">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
          {error}
        </div>
      )}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-violet-600">Workspace / Overview</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight">مرکز کنترل کسب‌وکار</h1>
          <p className="mt-1 text-xs text-slate-500">وضعیت لحظه‌ای فروش، تولید و ارتباط با مشتری</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/services" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold shadow-sm hover:bg-slate-50">
            مدیریت خدمات
          </Link>
          <Link href="/request" className="rounded-md bg-slate-950 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-violet-700">
            + سفارش جدید
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value, hint, color]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,.04)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{label}</span>
              <span className={`text-xs ${color}`}>●</span>
            </div>
            <p className="mt-3 text-2xl font-black tracking-tight">{value}</p>
            <p className="mt-1 text-[10px] text-slate-400">{hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_.8fr]">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-sm font-black">جریان سفارش‌ها</h2>
              <p className="mt-1 text-[10px] text-slate-400">آخرین فعالیت‌های عملیاتی</p>
            </div>
            <Link href="/admin/orders" className="text-xs font-bold text-violet-600">مشاهده همه ←</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-right text-xs">
              <thead className="bg-slate-50 text-[10px] text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">شناسه</th>
                  <th className="px-4 py-3 font-semibold">مشتری</th>
                  <th className="px-4 py-3 font-semibold">وضعیت</th>
                  <th className="px-4 py-3 font-semibold">اولویت</th>
                  <th className="px-4 py-3 font-semibold">تاریخ</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {(data?.requests ?? []).slice(0, 8).map((request) => (
                  <tr key={request.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-mono font-bold" dir="ltr">{request.trackingCode}</td>
                    <td className="px-4 py-3.5 font-semibold">{request.contactName}</td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700">
                        {STATUS_LABELS[request.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{request.priority === "urgent" ? "فوری" : request.priority === "high" ? "بالا" : "عادی"}</td>
                    <td className="px-4 py-3.5 text-slate-500">{formatDate(request.createdAt)}</td>
                    <td className="px-4 py-3.5">
                      <Link href={`/admin/requests/${request.id}`} className="text-violet-600">بازکردن</Link>
                    </td>
                  </tr>
                ))}
                {!data?.requests.length && (
                  <tr><td colSpan={6} className="py-14 text-center text-slate-400">هنوز سفارشی ثبت نشده است.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black">تحلیل سفارش‌ها</h2>
                <p className="mt-1 text-[10px] text-slate-400">نمای زنده از عملکرد عملیاتی</p>
              </div>
              <span className="rounded bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">داده واقعی</span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black">روند ۷ روزه</h3>
                  <span className="text-[9px] text-slate-400">نمودار خطی</span>
                </div>
                <svg viewBox="0 0 320 120" className="mt-3 h-28 w-full" role="img" aria-label="روند سفارش‌های هفت روز گذشته">
                  {[25, 65, 105].map((y) => (
                    <line key={y} x1="10" y1={y} x2="310" y2={y} stroke="#e2e8f0" strokeWidth="1" />
                  ))}
                  <polyline points={linePoints} fill="none" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  {dailyOrders.map((item, index) => (
                    <circle key={index} cx={index * 50 + 10} cy={105 - (item.count / maxDaily) * 80} r="4" fill="#fff" stroke="#7c3aed" strokeWidth="3">
                      <title>{item.label}: {item.count.toLocaleString("fa-IR")} سفارش</title>
                    </circle>
                  ))}
                </svg>
                <div className="flex justify-between text-[9px] text-slate-400">
                  {dailyOrders.map((item, index) => <span key={index}>{item.label}</span>)}
                </div>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black">وضعیت سفارش‌ها</h3>
                  <span className="text-[9px] text-slate-400">دوناتی</span>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div
                    className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full"
                    style={{ background: `conic-gradient(${donutGradient || "#e2e8f0 0 100%"})` }}
                    role="img"
                    aria-label={`توزیع وضعیت ${requests.length.toLocaleString("fa-IR")} سفارش`}
                  >
                    <div className="grid h-16 w-16 place-items-center rounded-full bg-white text-center">
                      <span className="text-lg font-black">{requests.length.toLocaleString("fa-IR")}</span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    {statusChart.map((item) => (
                      <div key={item.key} className="flex items-center gap-2 text-[9px]">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="flex-1 text-slate-500">{item.label}</span>
                        <b>{item.count.toLocaleString("fa-IR")}</b>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-4 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black">توزیع اولویت</h3>
                  <span className="text-[9px] text-slate-400">نمودار ستونی</span>
                </div>
                <div className="mt-5 flex h-28 items-end justify-around gap-8">
                  {priorities.map(([label, count, color]) => (
                    <div key={label} className="flex h-full flex-1 flex-col items-center justify-end">
                      <span className="mb-1 text-[9px] font-bold">{count.toLocaleString("fa-IR")}</span>
                      <div
                        className="w-full max-w-16 rounded-t-md transition-all"
                        style={{
                          height: `${Math.max(8, (count / maxPriority) * 82)}%`,
                          backgroundColor: color,
                        }}
                      />
                      <span className="mt-2 text-[9px] text-slate-500">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black">سلامت سیستم</h2>
              <span className="text-[10px] font-bold text-emerald-600">● عملیاتی</span>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              {[
                ["API و احراز هویت", "پاسخ‌گو"],
                ["پایگاه داده", "متصل"],
                ["خدمات فعال", `${data?.services.filter((s) => s.active).length ?? 0} مورد`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-slate-100 pb-2 last:border-0">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-bold">{value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
