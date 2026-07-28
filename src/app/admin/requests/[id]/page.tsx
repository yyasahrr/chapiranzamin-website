"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ItemsList,
  MessageThread,
  InfoRow,
  type DetailItem,
  type DetailMessage,
} from "@/components/request-detail";
import {
  PRIORITY_LABELS,
  REQUEST_TYPE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_ORDER,
  formatDate,
} from "@/lib/constants";

type Detail = {
  request: {
    id: number;
    trackingCode: string;
    requestType: string;
    status: string;
    priority: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string | null;
    desiredDeliveryDate: string | null;
    needsDesign: boolean;
    needsInstallation: boolean;
    needsPermitFollowup: boolean;
    description: string | null;
    adminNotes: string | null;
    meetingScheduledAt: string | null;
    createdAt: string;
  };
  items: DetailItem[];
  messages: DetailMessage[];
  organization: {
    name: string;
    organizationType: string | null;
    phone: string | null;
    address: string | null;
  } | null;
};

export default function AdminRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<Detail | null>(null);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [meeting, setMeeting] = useState("");
  const [saved, setSaved] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/requests/${id}`);
    if (res.status === 401) return router.replace("/login");
    if (res.status === 403) return router.replace("/dashboard");
    if (!res.ok) return router.replace("/admin");
    const d: Detail = await res.json();
    setData(d);
    setNotes(d.request.adminNotes ?? "");
    if (d.request.meetingScheduledAt) {
      const dt = new Date(d.request.meetingScheduledAt);
      setMeeting(new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    }
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function patch(body: Record<string, unknown>, message = "ذخیره شد ✓") {
    setSaving(true);
    setSaved("");
    const res = await fetch(`/api/admin/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setSaved(message);
      await load();
      setTimeout(() => setSaved(""), 2500);
    }
    setSaving(false);
  }

  async function sendMessage(text: string) {
    setSending(true);
    await fetch(`/api/requests/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    await load();
    setSending(false);
  }

  if (!data)
    return <p className="py-24 text-center text-sm text-ink-700/60">در حال بارگذاری...</p>;

  const r = data.request;

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link href="/admin" className="text-sm font-bold text-cyanink">→ بازگشت به پنل مدیریت</Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-black text-ink-900" dir="ltr">{r.trackingCode}</h1>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-4 py-1.5 text-xs font-bold ${STATUS_COLORS[r.status]}`}>
              {STATUS_LABELS[r.status]}
            </span>
            {saved && <span className="text-xs font-bold text-emerald-600">{saved}</span>}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* ستون مدیریت */}
          <div className="space-y-6">
            <div className="border-2 border-ink-900 bg-white shadow-[4px_4px_0_0_#141414] p-6">
              <h2 className="mb-4 font-black text-ink-900">مدیریت وضعیت</h2>
              <label className="mb-1.5 block text-xs font-bold text-ink-700">وضعیت درخواست</label>
              <select
                value={r.status}
                onChange={(e) => patch({ status: e.target.value }, "وضعیت به‌روزرسانی شد ✓")}
                disabled={saving}
                className="w-full rounded-lg border-2 border-ink-900 px-3.5 py-2.5 text-sm outline-none"
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>

              <label className="mb-1.5 mt-4 block text-xs font-bold text-ink-700">اولویت</label>
              <select
                value={r.priority}
                onChange={(e) => patch({ priority: e.target.value }, "اولویت به‌روزرسانی شد ✓")}
                disabled={saving}
                className="w-full rounded-lg border-2 border-ink-900 px-3.5 py-2.5 text-sm outline-none"
              >
                {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>

              <label className="mb-1.5 mt-4 block text-xs font-bold text-ink-700">زمان جلسه مشاوره</label>
              <input
                type="datetime-local"
                dir="ltr"
                value={meeting}
                onChange={(e) => setMeeting(e.target.value)}
                className="w-full rounded-lg border-2 border-ink-900 px-3.5 py-2.5 text-sm outline-none"
              />
              <button
                onClick={() => patch({ meetingScheduledAt: meeting || null }, "جلسه ثبت شد ✓")}
                disabled={saving}
                className="mt-2 w-full brut-press border-2 border-ink-900 bg-cyanink shadow-[3px_3px_0_0_#141414] py-2.5 text-sm font-bold text-white transition hover:bg-cyanink-dark disabled:opacity-60"
              >
                ثبت جلسه
              </button>
            </div>

            <div className="rounded-2xl border border-goldc/40 bg-white p-6">
              <h2 className="mb-2 font-black text-ink-900">یادداشت داخلی</h2>
              <p className="mb-3 text-[11px] text-ink-700/60">
                فقط برای مدیران — هرگز به مشتری نمایش داده نمی‌شود.
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full rounded-lg border-2 border-ink-900 px-3.5 py-2.5 text-sm outline-none"
              />
              <button
                onClick={() => patch({ adminNotes: notes }, "یادداشت ذخیره شد ✓")}
                disabled={saving}
                className="mt-2 w-full brut-press border-2 border-ink-900 bg-ink-900 shadow-[3px_3px_0_0_#ff4d12] py-2.5 text-sm font-bold text-paper transition hover:bg-ink-800 disabled:opacity-60"
              >
                ذخیره یادداشت
              </button>
            </div>
          </div>

          {/* ستون اطلاعات */}
          <div className="space-y-6">
            <div className="border-2 border-ink-900 bg-white shadow-[4px_4px_0_0_#141414] p-6">
              <h2 className="mb-3 font-black text-ink-900">اطلاعات متقاضی</h2>
              <InfoRow label="نام" value={r.contactName} />
              <InfoRow label="موبایل" value={<span dir="ltr">{r.contactPhone}</span>} />
              {r.contactEmail && <InfoRow label="ایمیل" value={<span dir="ltr">{r.contactEmail}</span>} />}
              <InfoRow label="نوع" value={REQUEST_TYPE_LABELS[r.requestType]} />
              <InfoRow label="تاریخ ثبت" value={formatDate(r.createdAt)} />
              {r.desiredDeliveryDate && (
                <InfoRow label="تحویل موردنظر" value={formatDate(r.desiredDeliveryDate)} />
              )}
              <InfoRow
                label="خدمات تکمیلی"
                value={
                  [
                    r.needsDesign && "طراحی",
                    r.needsInstallation && "نصب",
                    r.needsPermitFollowup && "پیگیری مجوز",
                  ]
                    .filter(Boolean)
                    .join("، ") || "—"
                }
              />
              {data.organization && (
                <>
                  <InfoRow label="سازمان" value={data.organization.name} />
                  {data.organization.organizationType && (
                    <InfoRow label="نوع سازمان" value={data.organization.organizationType} />
                  )}
                </>
              )}
              {r.description && (
                <p className="mt-3 rounded-lg bg-paper p-3 text-sm leading-7 text-ink-700">
                  {r.description}
                </p>
              )}
            </div>

            <div className="border-2 border-ink-900 bg-white shadow-[4px_4px_0_0_#141414] p-6">
              <h2 className="mb-4 font-black text-ink-900">
                آیتم‌ها ({data.items.length.toLocaleString("fa-IR")})
              </h2>
              <ItemsList items={data.items} />
            </div>
          </div>

          {/* ستون گفت‌وگو */}
          <div className="border-2 border-ink-900 bg-white shadow-[4px_4px_0_0_#141414] p-6">
            <h2 className="mb-4 font-black text-ink-900">گفت‌وگو با متقاضی</h2>
            <MessageThread
              messages={data.messages}
              viewerRole="admin"
              onSend={sendMessage}
              sending={sending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
