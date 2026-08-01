"use client";

import {
  CATEGORY_LABELS,
  formatDate,
  formatDateTime,
} from "@/lib/constants";

export type DetailItem = {
  id: number;
  category: string;
  title: string;
  quantity: number;
  width: string | null;
  height: string | null;
  dimensionUnit: string;
  material: string | null;
  installationLocation: string | null;
  installationAddress: string | null;
  requiresPermit: boolean;
  requiresInstallationTeam: boolean;
  description: string | null;
  selectedOptions: string;
};

export type DetailMessage = {
  id: number;
  message: string;
  senderRole: "admin" | "content_admin" | "support" | "customer";
  senderName: string;
  createdAt: string;
};

export type DetailFile = { token: string; name: string; size: number; mimeType: string };

export function FilesList({ files }: { files: DetailFile[] }) {
  if (!files.length) return <p className="text-xs text-ink-700/50">فایلی پیوست نشده است.</p>;
  return (
    <div className="space-y-2">
      {files.map((file) => (
        <a key={file.token} href={`/api/order-files/${file.token}`}
          className="flex items-center justify-between border border-ink-900/20 bg-paper p-3 text-xs font-bold hover:border-cyanink">
          <span>{file.name}</span>
          <span>{(file.size / 1024 / 1024).toFixed(1)} MB ↓</span>
        </a>
      ))}
    </div>
  );
}

export function ItemsList({ items }: { items: DetailItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.id} className="border-2 border-ink-900 bg-paper p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-black text-ink-900">{it.title}</span>
            <span className="border border-ink-900 bg-cyanink px-3 py-1 text-[11px] font-black text-white">
              {CATEGORY_LABELS[it.category]}
            </span>
          </div>
          <div className="mt-2 grid gap-1 text-xs text-ink-700/80 sm:grid-cols-2">
            <span>تعداد: {Number(it.quantity).toLocaleString("fa-IR")}</span>
            {it.width && it.height && (
              <span>
                ابعاد: {it.width}×{it.height} {it.dimensionUnit === "m" ? "متر" : "سانتی‌متر"}
              </span>
            )}
            {it.material && <span>متریال: {it.material}</span>}
            {(() => {
              try {
                const options = JSON.parse(it.selectedOptions || "[]") as Array<{
                  groupLabel: string;
                  label: string;
                }>;
                return options.map((option) => (
                  <span key={option.groupLabel}>
                    {option.groupLabel}: {option.label}
                  </span>
                ));
              } catch {
                return null;
              }
            })()}
            {it.installationLocation && <span>محل نصب: {it.installationLocation}</span>}
            {it.installationAddress && (
              <span className="sm:col-span-2">آدرس نصب: {it.installationAddress}</span>
            )}
            {(it.requiresPermit || it.requiresInstallationTeam) && (
              <span className="sm:col-span-2">
                {[it.requiresPermit && "نیاز به مجوز", it.requiresInstallationTeam && "نیاز به تیم نصب"]
                  .filter(Boolean)
                  .join(" • ")}
              </span>
            )}
            {it.description && <span className="sm:col-span-2">توضیح: {it.description}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessageThread({
  messages,
  viewerRole,
  onSend,
  sending,
}: {
  messages: DetailMessage[];
  viewerRole: "staff" | "customer";
  onSend: (text: string) => Promise<void>;
  sending: boolean;
}) {
  return (
    <div>
      <div className="max-h-96 space-y-3 overflow-y-auto rounded-xl bg-paper p-4">
        {messages.length === 0 && (
          <p className="py-6 text-center text-xs text-ink-700/50">
            هنوز پیامی رد و بدل نشده است.
          </p>
        )}
        {messages.map((m) => {
          const mine =
            viewerRole === "staff"
              ? m.senderRole !== "customer"
              : m.senderRole === "customer";
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                  mine
                    ? "rounded-bl-sm bg-cyanink text-white"
                    : "rounded-br-sm border-2 border-ink-900 bg-white text-ink-900"
                }`}
              >
                <div className={`mb-1 text-[10px] font-bold ${mine ? "text-white/70" : "text-ink-700/60"}`}>
                  {m.senderRole !== "customer" ? "کارشناس چاپ ایران‌زمین" : m.senderName} •{" "}
                  {formatDateTime(m.createdAt)}
                </div>
                {m.message}
              </div>
            </div>
          );
        })}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const input = form.elements.namedItem("msg") as HTMLInputElement;
          const text = input.value.trim();
          if (!text) return;
          await onSend(text);
          input.value = "";
        }}
      >
        <input
          name="msg"
          placeholder="پیام خود را بنویسید..."
          className="flex-1 rounded-xl border-2 border-ink-900 bg-white px-4 py-3 text-sm outline-none focus:border-cyanink"
        />
        <button
          disabled={sending}
          className="brut-press border-2 border-ink-900 bg-ink-900 shadow-[4px_4px_0_0_#ff4d12] px-6 py-3 text-sm font-bold text-paper transition hover:bg-ink-800 disabled:opacity-60"
        >
          ارسال
        </button>
      </form>
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-ink-900/15 py-2 text-sm last:border-0">
      <span className="text-ink-700/60">{label}</span>
      <span className="font-bold text-ink-900">{value}</span>
    </div>
  );
}

export { formatDate };
