"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import {
  CATEGORY_LABELS,
  INSTALL_LOCATIONS,
  MATERIALS,
  ORG_TYPES,
} from "@/lib/constants";

type Item = {
  category: string;
  title: string;
  quantity: number;
  width: string;
  height: string;
  dimensionUnit: "cm" | "m";
  material: string;
  installationLocation: string;
  installationAddress: string;
  requiresPermit: boolean;
  requiresInstallationTeam: boolean;
  description: string;
};

const emptyItem = (): Item => ({
  category: "banner",
  title: "",
  quantity: 1,
  width: "",
  height: "",
  dimensionUnit: "cm",
  material: "",
  installationLocation: "",
  installationAddress: "",
  requiresPermit: false,
  requiresInstallationTeam: false,
  description: "",
});

const STEPS = ["نوع درخواست و تماس", "آیتم‌های خدمت", "خدمات تکمیلی", "بازبینی و ثبت"];

const inputCls =
  "w-full rounded-lg border-2 border-ink-900 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-cyanink focus:ring-2 focus:ring-cyanink/20";
const labelCls = "mb-1.5 block text-xs font-bold text-ink-700";

function RequestForm() {
  const sp = useSearchParams();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trackingCode, setTrackingCode] = useState("");

  const [requestType, setRequestType] = useState(
    sp.get("type") === "organization" ? "organization" : "personal"
  );
  const [contact, setContact] = useState({ name: "", phone: "", email: "" });
  const [org, setOrg] = useState({
    name: "",
    organizationType: "",
    registrationNumber: "",
    economicCode: "",
    phone: "",
    email: "",
    address: "",
  });
  const [items, setItems] = useState<Item[]>([emptyItem()]);
  const [extra, setExtra] = useState({
    needsDesign: false,
    needsInstallation: false,
    needsPermitFollowup: false,
    desiredDeliveryDate: "",
    description: "",
  });

  const isOrg = requestType !== "personal";

  function validateStep(): string {
    if (step === 0) {
      if (contact.name.trim().length < 2) return "نام نماینده / تماس‌گیرنده را وارد کنید.";
      if (!/^09\d{9}$/.test(contact.phone)) return "شماره موبایل باید ۱۱ رقم و با 09 شروع شود.";
      if (isOrg && org.name.trim().length < 2) return "نام سازمان را وارد کنید.";
    }
    if (step === 1) {
      if (items.length === 0) return "حداقل یک آیتم اضافه کنید.";
      for (const it of items) {
        if (!it.title.trim()) return "عنوان همه آیتم‌ها را وارد کنید.";
      }
    }
    return "";
  }

  function next() {
    const err = validateStep();
    if (err) return setError(err);
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function updateItem(i: number, patch: Partial<Item>) {
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType,
          contactName: contact.name,
          contactPhone: contact.phone,
          contactEmail: contact.email || null,
          organization: isOrg ? org : null,
          items,
          ...extra,
          desiredDeliveryDate: extra.desiredDeliveryDate || null,
          needsConsultation: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "خطا در ثبت درخواست");
      setTrackingCode(data.trackingCode);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطای غیرمنتظره");
    } finally {
      setLoading(false);
    }
  }

  if (trackingCode) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="border-2 border-ink-900 bg-white shadow-[6px_6px_0_0_#141414] p-10">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl">
            ✅
          </div>
          <h1 className="text-xl font-black text-ink-900">درخواست شما ثبت شد</h1>
          <p className="mt-3 text-sm leading-7 text-ink-700/70">
            کارشناسان ما حداکثر تا ۲۴ ساعت آینده با شما تماس می‌گیرند. کد رهگیری خود را
            نگه دارید:
          </p>
          <div className="mt-5 brut-press border-2 border-ink-900 bg-ink-900 shadow-[4px_4px_0_0_#ff4d12] py-4 text-2xl font-black tracking-widest text-goldc" dir="ltr">
            {trackingCode}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/track" className="flex-1 brut-press border-2 border-ink-900 bg-white shadow-[4px_4px_0_0_#141414] px-5 py-3 text-sm font-bold">
              رهگیری درخواست
            </Link>
            <Link href="/register" className="flex-1 brut-press border-2 border-ink-900 bg-reg shadow-[4px_4px_0_0_#141414] px-5 py-3 text-sm font-bold text-white">
              ساخت حساب کاربری
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-center text-2xl font-black text-ink-900">
        ثبت درخواست مشاوره
      </h1>
      <p className="mt-2 text-center text-sm text-ink-700/70">
        بدون قیمت‌گذاری خودکار — پس از بررسی، پیشنهاد اختصاصی دریافت می‌کنید.
      </p>

      {/* Stepper */}
      <div className="mt-8 flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 flex-col items-center">
            <div
              className={`grid h-9 w-9 place-items-center rounded-full text-xs font-black transition ${
                i < step
                  ? "bg-emerald-500 text-white"
                  : i === step
                    ? "bg-reg text-white"
                    : "bg-ink-100 text-ink-700"
              }`}
            >
              {i < step ? "✓" : (i + 1).toLocaleString("fa-IR")}
            </div>
            <span className="mt-2 hidden text-[10px] font-bold text-ink-700 sm:block">{s}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 border-2 border-ink-900 bg-white shadow-[6px_6px_0_0_#141414] p-6 md:p-8">
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className={labelCls}>نوع درخواست</label>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["personal", "شخصی / کسب‌وکار", "🧑‍💼"],
                  ["organization", "سازمانی", "🏢"],
                  ["municipal", "شهری / شهرداری", "🏛️"],
                ].map(([val, label, icon]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRequestType(val)}
                    className={`rounded-xl border-2 p-4 text-center text-sm font-bold transition ${
                      requestType === val
                        ? "border-reg bg-reg/5 text-reg"
                        : "border-ink-900/30 text-ink-700 hover:border-ink-700/30"
                    }`}
                  >
                    <span className="mb-1 block text-2xl">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>نام و نام‌خانوادگی نماینده *</label>
                <input className={inputCls} value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>شماره موبایل *</label>
                <input className={inputCls} dir="ltr" placeholder="09xxxxxxxxx" value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>ایمیل (اختیاری)</label>
                <input className={inputCls} dir="ltr" value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })} />
              </div>
            </div>

            {isOrg && (
              <div className="rounded-2xl bg-paper p-5">
                <h3 className="mb-4 text-sm font-black text-cyanink">اطلاعات سازمان</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>نام سازمان *</label>
                    <input className={inputCls} value={org.name}
                      onChange={(e) => setOrg({ ...org, name: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>نوع سازمان</label>
                    <select className={inputCls} value={org.organizationType}
                      onChange={(e) => setOrg({ ...org, organizationType: e.target.value })}>
                      <option value="">انتخاب کنید</option>
                      {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>شماره ثبت (اختیاری)</label>
                    <input className={inputCls} dir="ltr" value={org.registrationNumber}
                      onChange={(e) => setOrg({ ...org, registrationNumber: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>تلفن سازمان (اختیاری)</label>
                    <input className={inputCls} dir="ltr" value={org.phone}
                      onChange={(e) => setOrg({ ...org, phone: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>آدرس سازمان (اختیاری)</label>
                    <input className={inputCls} value={org.address}
                      onChange={(e) => setOrg({ ...org, address: e.target.value })} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            {items.map((it, i) => (
              <div key={i} className="border-2 border-ink-900 bg-paper p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-black text-ink-900">
                    آیتم {(i + 1).toLocaleString("fa-IR")}
                  </h3>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                      className="text-xs font-bold text-reg"
                    >
                      حذف آیتم
                    </button>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>دسته خدمت *</label>
                    <select className={inputCls} value={it.category}
                      onChange={(e) => updateItem(i, { category: e.target.value })}>
                      {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>عنوان *</label>
                    <input className={inputCls} placeholder="مثلاً: بنر مناسبتی دهه فجر" value={it.title}
                      onChange={(e) => updateItem(i, { title: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>تعداد</label>
                    <input type="number" min={1} className={inputCls} value={it.quantity}
                      onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className={labelCls}>عرض</label>
                      <input type="number" className={inputCls} value={it.width}
                        onChange={(e) => updateItem(i, { width: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>ارتفاع</label>
                      <input type="number" className={inputCls} value={it.height}
                        onChange={(e) => updateItem(i, { height: e.target.value })} />
                    </div>
                    <div>
                      <label className={labelCls}>واحد</label>
                      <select className={inputCls} value={it.dimensionUnit}
                        onChange={(e) => updateItem(i, { dimensionUnit: e.target.value as "cm" | "m" })}>
                        <option value="cm">سانتی‌متر</option>
                        <option value="m">متر</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>متریال</label>
                    <select className={inputCls} value={it.material}
                      onChange={(e) => updateItem(i, { material: e.target.value })}>
                      <option value="">انتخاب کنید</option>
                      {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>محل اجرا / نصب</label>
                    <select className={inputCls} value={it.installationLocation}
                      onChange={(e) => updateItem(i, { installationLocation: e.target.value })}>
                      <option value="">انتخاب کنید</option>
                      {INSTALL_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>آدرس محل نصب (اختیاری)</label>
                    <input className={inputCls} value={it.installationAddress}
                      onChange={(e) => updateItem(i, { installationAddress: e.target.value })} />
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold text-ink-700">
                    <input type="checkbox" checked={it.requiresPermit}
                      onChange={(e) => updateItem(i, { requiresPermit: e.target.checked })} />
                    نیاز به مجوز شهرداری دارد
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-ink-700">
                    <input type="checkbox" checked={it.requiresInstallationTeam}
                      onChange={(e) => updateItem(i, { requiresInstallationTeam: e.target.checked })} />
                    نیاز به تیم نصب دارد
                  </label>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>توضیحات آیتم (اختیاری)</label>
                    <textarea className={inputCls} rows={2} value={it.description}
                      onChange={(e) => updateItem(i, { description: e.target.value })} />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setItems([...items, emptyItem()])}
              className="w-full rounded-xl border-2 border-dashed border-cyanink/40 py-3 text-sm font-bold text-cyanink transition hover:bg-cyanink/5"
            >
              + افزودن آیتم دیگر
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["needsDesign", "نیاز به طراحی", "🎨"],
                ["needsInstallation", "نیاز به نصب", "🔧"],
                ["needsPermitFollowup", "پیگیری مجوز", "📋"],
              ].map(([key, label, icon]) => {
                const checked = extra[key as "needsDesign"];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setExtra({ ...extra, [key]: !checked })}
                    className={`rounded-xl border-2 p-4 text-sm font-bold transition ${
                      checked
                        ? "border-cyanink bg-cyanink/5 text-cyanink"
                        : "border-ink-900/30 text-ink-700"
                    }`}
                  >
                    <span className="mb-1 block text-2xl">{icon}</span>
                    {label}
                  </button>
                );
              })}
            </div>
            <div>
              <label className={labelCls}>تاریخ تحویل موردنظر (اختیاری)</label>
              <input type="date" className={inputCls} dir="ltr" value={extra.desiredDeliveryDate}
                onChange={(e) => setExtra({ ...extra, desiredDeliveryDate: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>توضیحات کلی پروژه (اختیاری)</label>
              <textarea className={inputCls} rows={4}
                placeholder="هر توضیحی که به مشاوره بهتر کمک می‌کند..."
                value={extra.description}
                onChange={(e) => setExtra({ ...extra, description: e.target.value })} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-sm">
            <div className="rounded-xl bg-paper p-4">
              <h3 className="mb-2 font-black text-ink-900">اطلاعات تماس</h3>
              <p className="text-ink-700">
                {contact.name} — <span dir="ltr">{contact.phone}</span>
                {isOrg && org.name ? ` — سازمان: ${org.name}` : ""}
              </p>
            </div>
            <div className="rounded-xl bg-paper p-4">
              <h3 className="mb-2 font-black text-ink-900">
                آیتم‌ها ({items.length.toLocaleString("fa-IR")})
              </h3>
              <ul className="space-y-1 text-ink-700">
                {items.map((it, i) => (
                  <li key={i}>
                    • {CATEGORY_LABELS[it.category]} — {it.title} × {it.quantity.toLocaleString("fa-IR")}
                    {it.width && it.height
                      ? ` (${it.width}×${it.height} ${it.dimensionUnit === "m" ? "متر" : "سانتی‌متر"})`
                      : ""}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-paper p-4 text-ink-700">
              <h3 className="mb-2 font-black text-ink-900">خدمات تکمیلی</h3>
              {[
                extra.needsDesign && "طراحی",
                extra.needsInstallation && "نصب",
                extra.needsPermitFollowup && "پیگیری مجوز",
              ]
                .filter(Boolean)
                .join("، ") || "—"}
            </div>
            <p className="text-xs leading-6 text-ink-700/60">
              با ثبت این درخواست، کارشناسان چاپ ایران‌زمین برای مشاوره و ارائه پیشنهاد
              اختصاصی با شما تماس می‌گیرند. هیچ قیمتی به‌صورت خودکار محاسبه نمی‌شود.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => { setError(""); setStep(step - 1); }}
              className="brut-press border-2 border-ink-900 bg-white shadow-[4px_4px_0_0_#141414] px-6 py-3 text-sm font-bold text-ink-900"
            >
              مرحله قبل
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="flex-1 brut-press border-2 border-ink-900 bg-ink-900 shadow-[4px_4px_0_0_#ff4d12] px-6 py-3 text-sm font-bold text-paper transition hover:bg-ink-800"
            >
              مرحله بعد
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="flex-1 brut-press border-2 border-ink-900 bg-reg shadow-[4px_4px_0_0_#141414] px-6 py-3 text-sm font-bold text-white transition hover:bg-reg-dark disabled:opacity-60"
            >
              {loading ? "در حال ثبت..." : "ثبت نهایی درخواست"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RequestPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Suspense>
        <RequestForm />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
