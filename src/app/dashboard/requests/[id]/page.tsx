"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import SiteHeader from "@/components/site-header";
import {
  ItemsList,
  FilesList,
  type DetailFile,
  MessageThread,
  InfoRow,
  type DetailItem,
  type DetailMessage,
} from "@/components/request-detail";
import {
  REQUEST_TYPE_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  formatDate,
  formatDateTime,
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
    desiredDeliveryDate: string | null;
    needsDesign: boolean;
    needsInstallation: boolean;
    needsPermitFollowup: boolean;
    description: string | null;
    meetingScheduledAt: string | null;
    createdAt: string;
    estimatedTotal: string;
    finalTotal: string | null;
  };
  items: DetailItem[];
  files: DetailFile[];
  messages: DetailMessage[];
  organization: { name: string; organizationType: string | null } | null;
};

export default function CustomerRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<Detail | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/requests/${id}`);
    if (res.status === 401) return router.replace("/login");
    if (!res.ok) return router.replace("/dashboard");
    setData(await res.json());
  }, [id, router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

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
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <p className="py-24 text-center text-sm text-ink-700/60">در حال بارگذاری...</p>
      </div>
    );

  const r = data.request;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link href="/dashboard" className="text-sm font-bold text-cyanink">
          → بازگشت به داشبورد
        </Link>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-black text-ink-900" dir="ltr">{r.trackingCode}</h1>
          <span className={`rounded-full px-4 py-1.5 text-xs font-bold ${STATUS_COLORS[r.status]}`}>
            {STATUS_LABELS[r.status]}
          </span>
        </div>
        <div className="mt-4 rounded-lg border border-ink-900 bg-goldc p-4">
          <span className="text-xs font-bold">مبلغ سفارش</span>
          <strong className="mr-3 text-lg">
            {Number(r.finalTotal ?? r.estimatedTotal) > 0
              ? `${Number(r.finalTotal ?? r.estimatedTotal).toLocaleString("fa-IR")} تومان`
              : "در انتظار قیمت‌گذاری کارشناس"}
          </strong>
        </div>

        {r.meetingScheduledAt && (
          <div className="mt-4 rounded-xl bg-purple-50 px-4 py-3 text-sm font-bold text-purple-800">
            📅 جلسه مشاوره شما: {formatDateTime(r.meetingScheduledAt)}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="border-2 border-ink-900 bg-white shadow-[4px_4px_0_0_#141414] p-6">
              <h2 className="mb-3 font-black text-ink-900">اطلاعات درخواست</h2>
              <InfoRow label="نوع" value={REQUEST_TYPE_LABELS[r.requestType]} />
              <InfoRow label="تاریخ ثبت" value={formatDate(r.createdAt)} />
              <InfoRow label="نماینده" value={r.contactName} />
              {data.organization && <InfoRow label="سازمان" value={data.organization.name} />}
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
              <h3 className="mb-3 mt-6 text-sm font-black">فایل‌های طرح</h3>
              <FilesList files={data.files ?? []} />
            </div>
          </div>

          <div className="border-2 border-ink-900 bg-white shadow-[4px_4px_0_0_#141414] p-6">
            <h2 className="mb-4 font-black text-ink-900">گفت‌وگو با کارشناس</h2>
            <MessageThread
              messages={data.messages}
              viewerRole="customer"
              onSend={sendMessage}
              sending={sending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
