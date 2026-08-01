"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import {
  CATEGORY_LABELS,
  INSTALL_LOCATIONS,
  MATERIALS,
} from "@/lib/constants";
import { readApiResponse } from "@/lib/client-api";
import {
  calculateConfiguredPrice,
  parsePricingConfig,
  parseFullPricingConfig,
  resolveFieldPrice,
  resolvePricingOptions,
  quantityWithinConfiguredRange,
  ORDER_ADDON_PRICES,
} from "@/lib/pricing";

type Item = {
  serviceId: number | null;
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
  selectedOptions: Record<string, string>;
};

const emptyItem = (): Item => ({
  serviceId: null,
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
  selectedOptions: {},
});

const STEPS = ["محصول و مشخصات", "فایل و خدمات", "تحویل و تماس", "بازبینی و ثبت"];

const inputCls =
  "w-full rounded-lg border-2 border-ink-900 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-cyanink focus:ring-2 focus:ring-cyanink/20";
const labelCls = "mb-1.5 block text-xs font-bold text-ink-700";

function RequestForm() {
  const searchParams = useSearchParams();
  const requestedServiceId = searchParams.get("service");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [checkoutRestored, setCheckoutRestored] = useState(false);
  const [artworkFiles, setArtworkFiles] = useState<
    { token: string; name: string; size: number }[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const [catalog, setCatalog] = useState<
    {
      id: number;
      name: string;
      category: string;
      pricingModel: "fixed" | "per_item" | "per_sqm" | "quote";
      basePrice: string;
      unitLabel: string;
      wizardConfig: string;
      pricingConfig: string;
    }[]
  >([]);

  const [contact, setContact] = useState({ name: "", phone: "", email: "" });
  const [items, setItems] = useState<Item[]>([emptyItem()]);
  const [extra, setExtra] = useState({
    needsDesign: false,
    needsInstallation: false,
    needsPermitFollowup: false,
    desiredDeliveryDate: "",
    shippingMethod: "pickup",
    deliveryAddress: "",
    description: "",
  });

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = sessionStorage.getItem("request-page-checkout");
        if (saved) {
          const parsed = JSON.parse(saved) as {
            step?: number;
            contact?: typeof contact;
            items?: Item[];
            extra?: typeof extra;
            artworkFiles?: typeof artworkFiles;
          };
          if (typeof parsed.step === "number") setStep(parsed.step);
          if (parsed.contact) setContact(parsed.contact);
          if (Array.isArray(parsed.items) && parsed.items.length) setItems(parsed.items);
          if (parsed.extra) setExtra(parsed.extra);
          if (Array.isArray(parsed.artworkFiles)) setArtworkFiles(parsed.artworkFiles);
        }
      } catch {
        sessionStorage.removeItem("request-page-checkout");
      } finally {
        setCheckoutRestored(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!checkoutRestored) return;
    sessionStorage.setItem(
      "request-page-checkout",
      JSON.stringify({ step, contact, items, extra, artworkFiles })
    );
  }, [step, contact, items, extra, artworkFiles, checkoutRestored]);

  useEffect(() => {
    fetch("/api/services", { cache: "no-store" })
      .then((response) =>
        readApiResponse<{
          message?: string;
          services: typeof catalog;
        }>(response)
      )
      .then((data) => {
        const services = data.services ?? [];
        setCatalog(services);
        const requestedService = Number(requestedServiceId);
        const service = services.find((entry) => entry.id === requestedService);
        if (service) {
          setItems([{
            ...emptyItem(),
            serviceId: service.id,
            category: service.category,
            title: service.name,
            quantity: parseFullPricingConfig(service.pricingConfig).quantityRules.min,
          }]);
        }
      })
      .catch(() => setCatalog([]));
  }, [requestedServiceId]);

  const estimate = useMemo(() => {
    const itemTotal = items.reduce((sum, item) => {
        const service = catalog.find((entry) => entry.id === item.serviceId);
        if (!service || service.pricingModel === "quote") return sum;
        const options = resolvePricingOptions(
          service.pricingConfig,
          item.selectedOptions
        );
        if (!options.valid) return sum;
        return (
          sum +
          calculateConfiguredPrice(
            service.pricingModel,
            service.basePrice,
            {
              quantity: Math.max(1, item.quantity),
              width: Number(item.width) || null,
              height: Number(item.height) || null,
              dimensionUnit: item.dimensionUnit,
              material: item.material,
              requiresInstallationTeam: item.requiresInstallationTeam,
              requiresPermit: item.requiresPermit,
            },
            service.pricingConfig,
            options.adjustment
          ).estimatedPrice
        );
      }, 0);
    return (
      itemTotal +
      (extra.needsDesign ? ORDER_ADDON_PRICES.needsDesign : 0) +
      (extra.needsInstallation ? ORDER_ADDON_PRICES.needsInstallation : 0) +
      (extra.needsPermitFollowup ? ORDER_ADDON_PRICES.needsPermitFollowup : 0)
    );
  }, [catalog, extra.needsDesign, extra.needsInstallation, extra.needsPermitFollowup, items]);

  function fieldEnabled(item: Item, field: string) {
    const service = catalog.find((entry) => entry.id === item.serviceId);
    if (!service) return true;
    try {
      const config = JSON.parse(service.wizardConfig || "{}") as Record<string, boolean>;
      return config[field] !== false;
    } catch {
      return true;
    }
  }

  function selectedOptionLabels(item: Item) {
    const service = catalog.find((entry) => entry.id === item.serviceId);
    return parsePricingConfig(service?.pricingConfig).flatMap((group) => {
      const selected = group.options.find(
        (option) => option.value === item.selectedOptions[group.key]
      );
      return selected ? [`${group.label}: ${selected.label}`] : [];
    });
  }

  function hasDedicatedMaterialOptions(item: Item) {
    const service = catalog.find((entry) => entry.id === item.serviceId);
    return parsePricingConfig(service?.pricingConfig).some((group) => {
      const identity = `${group.key} ${group.label}`.toLowerCase();
      return (
        identity.includes("material") ||
        identity.includes("stock") ||
        identity.includes("متریال") ||
        identity.includes("جنس")
      );
    });
  }

  function validateStep(): string {
    if (step === 2) {
      if (contact.name.trim().length < 2) return "نام نماینده / تماس‌گیرنده را وارد کنید.";
      if (!/^09\d{9}$/.test(contact.phone)) return "شماره موبایل باید ۱۱ رقم و با 09 شروع شود.";
      if (extra.shippingMethod !== "pickup" && extra.deliveryAddress.trim().length < 10)
        return "آدرس کامل تحویل را وارد کنید.";
    }
    if (step === 0) {
      if (items.length === 0) return "حداقل یک آیتم اضافه کنید.";
      for (const it of items) {
        if (!it.title.trim()) return "عنوان همه آیتم‌ها را وارد کنید.";
        const service = catalog.find((entry) => entry.id === it.serviceId);
        if (
          service &&
          !resolvePricingOptions(service.pricingConfig, it.selectedOptions).valid
        )
          return `گزینه‌های قیمت‌گذاری «${service.name}» را کامل انتخاب کنید.`;
        if (
          service &&
          !quantityWithinConfiguredRange(service.pricingConfig, it.quantity)
        ) {
          const rules = parseFullPricingConfig(service.pricingConfig).quantityRules;
          return `تیراژ «${service.name}» باید بین ${rules.min.toLocaleString("fa-IR")} و ${rules.max.toLocaleString("fa-IR")} باشد.`;
        }
        if (
          service &&
          (service.pricingModel === "per_sqm" ||
            parseFullPricingConfig(service.pricingConfig).calculationFactors.area.enabled) &&
          (!Number(it.width) || !Number(it.height))
        )
          return `ابعاد «${service.name}» را برای محاسبه قیمت وارد کنید.`;
      }
    }
    return "";
  }

  function next() {
    const err = validateStep();
    if (err) return setError(err);
    setError("");
    const nextStep = Math.min(step + 1, STEPS.length - 1);
    setStep(nextStep);
    window.setTimeout(() => {
      document
        .getElementById(nextStep === STEPS.length - 1 ? "order-review" : "wizard-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function updateItem(i: number, patch: Partial<Item>) {
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const session = await fetch("/api/auth/me", { cache: "no-store" });
      if (session.status === 401) {
        setAuthRequired(true);
        setLoading(false);
        return;
      }
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "personal",
          contactName: contact.name,
          contactPhone: contact.phone,
          contactEmail: contact.email || null,
          organization: null,
          items,
          artworkTokens: artworkFiles.map((file) => file.token),
          ...extra,
          desiredDeliveryDate: extra.desiredDeliveryDate || null,
          needsConsultation: true,
        }),
      });
      const data = await readApiResponse<{
        message?: string;
        trackingCode: string;
        invoiceId: number;
        paymentRequired: boolean;
      }>(res);
      setTrackingCode(data.trackingCode);
      setInvoiceId(data.paymentRequired ? data.invoiceId : null);
      sessionStorage.removeItem("request-page-checkout");
      if (data.paymentRequired) await startPayment(data.invoiceId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطای غیرمنتظره");
    } finally {
      setLoading(false);
    }
  }

  async function startPayment(targetInvoiceId: number) {
    try {
      const payment = await readApiResponse<{ redirectUrl: string; message?: string }>(
        await fetch("/api/payments/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceId: targetInvoiceId }),
        })
      );
      window.location.href = payment.redirectUrl;
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "اتصال به درگاه ناموفق بود.");
    }
  }

  async function uploadArtwork(file: File) {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/uploads/order-artwork", {
        method: "POST",
        body: formData,
      });
      const uploaded = await readApiResponse<{
        token: string;
        name: string;
        size: number;
        message?: string;
      }>(response);
      setArtworkFiles((current) => [...current, uploaded].slice(0, 5));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "آپلود فایل ناموفق بود.");
    } finally {
      setUploading(false);
    }
  }

  if (trackingCode) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="border-2 border-ink-900 bg-white shadow-[6px_6px_0_0_#141414] p-10">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl">
            ✅
          </div>
          <h1 className="text-xl font-black text-ink-900">سفارش شما ثبت شد</h1>
          <p className="mt-3 text-sm leading-7 text-ink-700/70">
            کارشناسان ما حداکثر تا ۲۴ ساعت آینده با شما تماس می‌گیرند. کد رهگیری خود را
            نگه دارید:
          </p>
          <div className="mt-5 brut-press border-2 border-ink-900 bg-ink-900 shadow-[4px_4px_0_0_#ff4d12] py-4 text-2xl font-black tracking-widest text-goldc" dir="ltr">
            {trackingCode}
          </div>
          {error && <p className="mt-4 bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/track" className="flex-1 brut-press border-2 border-ink-900 bg-white shadow-[4px_4px_0_0_#141414] px-5 py-3 text-sm font-bold">
              رهگیری سفارش
            </Link>
            {invoiceId ? (
              <button type="button" onClick={() => void startPayment(invoiceId)} className="flex-1 border-2 border-ink-900 bg-reg px-5 py-3 text-sm font-bold text-white">تلاش مجدد برای پرداخت</button>
            ) : (
              <Link href="/dashboard" className="flex-1 border-2 border-ink-900 bg-reg px-5 py-3 text-sm font-bold text-white">داشبورد کاربری</Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-center text-2xl font-black text-ink-900">
        ثبت سفارش چاپ
      </h1>
      <p className="mt-2 text-center text-sm text-ink-700/70">
        قیمت لحظه‌ای براساس خدمت و مشخصات سفارش محاسبه می‌شود.
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

      <div className="mt-8 grid gap-7">
      <div id="wizard-section" className="scroll-mt-24 border-2 border-ink-900 bg-white p-6 shadow-[6px_6px_0_0_#141414] md:p-8">
        {step === 2 && (
          <div className="space-y-5">
            <div className="border-2 border-ink-900 bg-paper p-4">
              <h2 className="text-base font-black text-ink-900">اطلاعات تحویل و تماس</h2>
              <p className="mt-1 text-xs leading-6 text-ink-700/70">
                برای تأیید فایل، زمان تحویل و هماهنگی نهایی با شما تماس می‌گیریم.
              </p>
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
              <div className="sm:col-span-2">
                <label className={labelCls}>روش دریافت سفارش</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ["pickup", "تحویل حضوری"],
                    ["courier", "پیک شهری"],
                    ["post", "ارسال پستی"],
                  ].map(([value, label]) => (
                    <button key={value} type="button"
                      onClick={() => setExtra({ ...extra, shippingMethod: value })}
                      className={`border-2 px-2 py-3 text-[10px] font-black ${
                        extra.shippingMethod === value
                          ? "border-ink-900 bg-goldc"
                          : "border-ink-900/20 bg-white"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {extra.shippingMethod !== "pickup" && (
                <div className="sm:col-span-2">
                  <label className={labelCls}>آدرس کامل تحویل *</label>
                  <textarea
                    rows={3}
                    className={inputCls}
                    placeholder="استان، شهر، خیابان، پلاک، واحد و کدپستی"
                    value={extra.deliveryAddress}
                    onChange={(e) => setExtra({ ...extra, deliveryAddress: e.target.value })}
                  />
                </div>
              )}
              <div className="sm:col-span-2">
                <label className={labelCls}>تاریخ تحویل موردنظر (اختیاری)</label>
                <input type="date" className={inputCls} dir="ltr" value={extra.desiredDeliveryDate}
                  onChange={(e) => setExtra({ ...extra, desiredDeliveryDate: e.target.value })} />
                {extra.desiredDeliveryDate && (
                  <p className="mt-1 text-[10px] font-bold text-ink-700/70">
                    تاریخ شمسی: {new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
                      year: "numeric", month: "long", day: "numeric",
                    }).format(new Date(`${extra.desiredDeliveryDate}T12:00:00`))}
                  </p>
                )}
              </div>
            </div>
            <Link
              href="/organization-consultation"
              className="block border-2 border-cyanink bg-cyanink/5 p-4 text-xs font-black text-cyanink"
            >
              سفارش سازمانی یا پروژه چندمرحله‌ای دارید؟ از فرم اختصاصی همکاری سازمانی استفاده کنید ←
            </Link>
          </div>
        )}

        {step === 0 && (
          <div className="space-y-6">
            <div className="border-2 border-ink-900 bg-ink-900 p-5 text-paper">
              <p className="text-[10px] font-black text-goldc">مرحله اول</p>
              <h2 className="mt-2 text-lg font-black">محصول را انتخاب و دقیق پیکربندی کنید</h2>
              <p className="mt-2 text-xs leading-6 text-paper/65">
                جنس، تیراژ، ابعاد، متریال، نصب و مجوز فقط وقتی نمایش داده می‌شوند که برای همان محصول لازم باشند.
              </p>
            </div>
            {items.map((it, i) => (
              <div key={i} className="border-2 border-ink-900 bg-paper p-5 shadow-[3px_3px_0_0_#141414]">
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
                  <div className="sm:col-span-2">
                    <label className={labelCls}>محصول یا خدمت موردنظر را انتخاب کنید</label>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {catalog.map((service) => {
                        const selected = it.serviceId === service.id;
                        return (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() =>
                              {
                              updateItem(i, {
                                serviceId: service.id,
                                category: service.category,
                                title: service.name,
                                selectedOptions: {},
                                material: "",
                                quantity: parseFullPricingConfig(service.pricingConfig).quantityRules.min,
                                requiresPermit: false,
                                requiresInstallationTeam: false,
                              });
                              window.setTimeout(() => {
                                document.getElementById(`item-config-${i}`)
                                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
                              }, 60);
                              }
                            }
                            className={`min-h-24 border-2 p-3 text-right transition ${
                              selected
                                ? "border-ink-900 bg-goldc shadow-[3px_3px_0_0_#141414]"
                                : "border-ink-900/20 bg-white hover:border-cyanink"
                            }`}
                          >
                            <span className="block text-xs font-black text-ink-900">{service.name}</span>
                            <span className="mt-2 block text-[10px] leading-5 text-ink-700/65">
                              {Number(service.basePrice)
                                ? `شروع از ${Number(service.basePrice).toLocaleString("fa-IR")} تومان`
                                : "قیمت پس از بررسی"}
                            </span>
                            {selected && <span className="mt-1 block text-[9px] font-black text-reg">✓ انتخاب شد</span>}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => updateItem(i, { serviceId: null, title: "", selectedOptions: {} })}
                        className={`min-h-24 border-2 p-3 text-right text-xs font-black ${
                          it.serviceId === null ? "border-ink-900 bg-paper" : "border-dashed border-ink-900/30 bg-white"
                        }`}
                      >
                        سفارش کاملاً سفارشی
                        <span className="mt-2 block text-[9px] font-normal text-ink-700/60">شرح سفارش را خودتان وارد کنید</span>
                      </button>
                    </div>
                  </div>
                  <div id={`item-config-${i}`} className="scroll-mt-24 sm:col-span-2" />
                  {(() => {
                    const service = catalog.find((entry) => entry.id === it.serviceId);
                    const groups = parsePricingConfig(service?.pricingConfig);
                    const rules = parseFullPricingConfig(service?.pricingConfig).quantityRules;
                    if (!groups.length) return null;
                    return (
                      <div className="sm:col-span-2 grid gap-4 border-2 border-ink-900/20 bg-white p-4 sm:grid-cols-2">
                        {groups.map((group) => (
                          <div key={group.key}>
                            <label className={labelCls}>
                              {group.label}{group.required ? " *" : ""}
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {group.options.map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => {
                                    updateItem(i, {
                                      selectedOptions: {
                                        ...it.selectedOptions,
                                        [group.key]: option.value,
                                      },
                                      ...(group.key === "run" && /^\d{1,6}$/.test(option.value)
                                        ? { quantity: Number(option.value) }
                                        : {}),
                                    });
                                    window.setTimeout(
                                      () => window.scrollBy({ top: 180, behavior: "smooth" }),
                                      60
                                    );
                                  }}
                                  className={`border-2 p-2.5 text-right text-[10px] font-bold transition ${
                                    it.selectedOptions[group.key] === option.value
                                      ? "border-cyanink bg-cyanink/5 text-cyanink"
                                      : "border-ink-900/20 bg-paper text-ink-700"
                                  }`}
                                >
                                  <span className="block">{option.label}</span>
                                  <span className="mt-1 block text-[9px] font-normal opacity-70">
                                    {option.priceAdjustment
                                      ? `${option.priceAdjustment > 0 ? "+" : ""}${option.priceAdjustment.toLocaleString("fa-IR")} تومان`
                                      : "بدون افزایش قیمت"}
                                  </span>
                                </button>
                              ))}
                              {group.key === "run" && rules.allowCustom && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateItem(i, {
                                      selectedOptions: {
                                        ...it.selectedOptions,
                                        [group.key]: "__custom__",
                                      },
                                      quantity: Math.max(rules.min, it.quantity),
                                    })
                                  }
                                  className={`border-2 p-2.5 text-right text-[10px] font-bold ${
                                    it.selectedOptions[group.key] === "__custom__"
                                      ? "border-reg bg-reg/5 text-reg"
                                      : "border-dashed border-ink-900/30 bg-white"
                                  }`}
                                >
                                  <span className="block">تیراژ دلخواه</span>
                                  <span className="mt-1 block text-[9px] font-normal opacity-70">
                                    {rules.min.toLocaleString("fa-IR")} تا {rules.max.toLocaleString("fa-IR")}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  {!it.serviceId && <div>
                    <label className={labelCls}>دسته خدمت *</label>
                    <select className={inputCls} value={it.category}
                      onChange={(e) => updateItem(i, { category: e.target.value })}>
                      {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>}
                  {!it.serviceId && <div>
                    <label className={labelCls}>عنوان *</label>
                    <input className={inputCls} placeholder="مثلاً: بنر مناسبتی دهه فجر" value={it.title}
                      onChange={(e) => updateItem(i, { title: e.target.value })} />
                  </div>}
                  {(fieldEnabled(it, "quantity") || it.selectedOptions.run === "__custom__") && (() => {
                    const service = catalog.find((entry) => entry.id === it.serviceId);
                    const config = parseFullPricingConfig(service?.pricingConfig);
                    const hasRun = config.optionGroups.some((group) => group.key === "run");
                    if (hasRun && it.selectedOptions.run !== "__custom__") return null;
                    return <div>
                    <label className={labelCls}>تعداد</label>
                    <input
                      type="number"
                      min={config.quantityRules.min}
                      max={config.quantityRules.max}
                      className={inputCls}
                      value={it.quantity}
                      onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })} />
                    <p className="mt-1 text-[9px] text-ink-700/55">
                      حداقل {config.quantityRules.min.toLocaleString("fa-IR")} — حداکثر {config.quantityRules.max.toLocaleString("fa-IR")}
                    </p>
                  </div>;
                  })()}
                  {fieldEnabled(it, "dimensions") && <div className="grid grid-cols-3 gap-2">
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
                  </div>}
                  {fieldEnabled(it, "material") && !hasDedicatedMaterialOptions(it) && <div>
                    <label className={labelCls}>
                      متریال
                      {(() => {
                        const service = catalog.find((entry) => entry.id === it.serviceId);
                        const factor = service
                          ? parseFullPricingConfig(service.pricingConfig).calculationFactors.material
                          : null;
                        return factor?.enabled && factor.price
                          ? ` (+${factor.price.toLocaleString("fa-IR")} تومان)`
                          : "";
                      })()}
                    </label>
                    <select className={inputCls} value={it.material}
                      onChange={(e) => updateItem(i, { material: e.target.value })}>
                      <option value="">انتخاب کنید</option>
                      {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>}
                  {fieldEnabled(it, "installation") && <div>
                    <label className={labelCls}>محل اجرا / نصب</label>
                    <select className={inputCls} value={it.installationLocation}
                      onChange={(e) => updateItem(i, { installationLocation: e.target.value })}>
                      <option value="">انتخاب کنید</option>
                      {INSTALL_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>}
                  {fieldEnabled(it, "installation") && <div className="sm:col-span-2">
                    <label className={labelCls}>آدرس محل نصب (اختیاری)</label>
                    <input className={inputCls} value={it.installationAddress}
                      onChange={(e) => updateItem(i, { installationAddress: e.target.value })} />
                  </div>}
                  {fieldEnabled(it, "permit") && <label className="flex items-center gap-2 text-xs font-bold text-ink-700">
                    <input type="checkbox" checked={it.requiresPermit}
                      onChange={(e) => updateItem(i, { requiresPermit: e.target.checked })} />
                    نیاز به مجوز شهرداری دارد
                    {(() => {
                      const service = catalog.find((entry) => entry.id === it.serviceId);
                      const amount = service
                        ? resolveFieldPrice(service.pricingConfig, {
                            requiresPermit: true,
                          })
                        : 0;
                      return amount ? ` (+${amount.toLocaleString("fa-IR")} تومان)` : "";
                    })()}
                  </label>}
                  {fieldEnabled(it, "installation") && <label className="flex items-center gap-2 text-xs font-bold text-ink-700">
                    <input type="checkbox" checked={it.requiresInstallationTeam}
                      onChange={(e) => updateItem(i, { requiresInstallationTeam: e.target.checked })} />
                    نیاز به تیم نصب دارد
                    {(() => {
                      const service = catalog.find((entry) => entry.id === it.serviceId);
                      const amount = service
                        ? resolveFieldPrice(service.pricingConfig, {
                            requiresInstallationTeam: true,
                          })
                        : 0;
                      return amount ? ` (+${amount.toLocaleString("fa-IR")} تومان)` : "";
                    })()}
                  </label>}
                  {fieldEnabled(it, "description") && <div className="sm:col-span-2">
                    <label className={labelCls}>توضیحات آیتم (اختیاری)</label>
                    <textarea className={inputCls} rows={2} value={it.description}
                      onChange={(e) => updateItem(i, { description: e.target.value })} />
                  </div>}
                  {it.serviceId && (() => {
                    const service = catalog.find((entry) => entry.id === it.serviceId);
                    if (!service || service.pricingModel === "quote") return null;
                    const options = resolvePricingOptions(service.pricingConfig, it.selectedOptions);
                    if (!options.valid) return null;
                    const price = calculateConfiguredPrice(
                      service.pricingModel,
                      service.basePrice,
                      {
                        quantity: Math.max(1, it.quantity),
                        width: Number(it.width) || null,
                        height: Number(it.height) || null,
                        dimensionUnit: it.dimensionUnit,
                        material: it.material,
                        requiresInstallationTeam: it.requiresInstallationTeam,
                        requiresPermit: it.requiresPermit,
                      },
                      service.pricingConfig,
                      options.adjustment
                    ).estimatedPrice;
                    return (
                      <div className="sm:col-span-2 flex items-center justify-between border-t-2 border-ink-900/15 pt-4 text-sm">
                        <span className="font-bold text-ink-700">قیمت این آیتم</span>
                        <strong className="text-base text-ink-900">
                          {price.toLocaleString("fa-IR")} تومان
                        </strong>
                      </div>
                    );
                  })()}
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

        {step === 1 && (
          <div className="space-y-5">
            <div className="grid gap-3">
              {[
                ["needsDesign", `طراحی (+${ORDER_ADDON_PRICES.needsDesign.toLocaleString("fa-IR")} تومان)`, "🎨"],
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
            <div className="border-2 border-dashed border-ink-900/30 bg-paper p-4">
              <label className={labelCls}>فایل طرح آماده (اختیاری)</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                disabled={uploading || artworkFiles.length >= 5}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadArtwork(file);
                  event.currentTarget.value = "";
                }}
                className="block w-full text-xs file:ml-3 file:border-0 file:bg-ink-900 file:px-4 file:py-2 file:font-bold file:text-white"
              />
              <p className="mt-2 text-[10px] text-ink-700/60">
                PDF، JPG یا PNG؛ حداکثر ۱۵ مگابایت برای هر فایل و حداکثر ۵ فایل.
              </p>
              {uploading && <p className="mt-2 text-xs font-bold">در حال آپلود امن…</p>}
              {artworkFiles.map((file) => (
                <div key={file.token} className="mt-2 flex justify-between gap-3 text-xs">
                  <span>{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                  <button type="button" className="font-bold text-reg"
                    onClick={() => setArtworkFiles((files) => files.filter((entry) => entry.token !== file.token))}>
                    حذف از سفارش
                  </button>
                </div>
              ))}
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
          <div id="order-review" className="scroll-mt-24 space-y-4 text-sm">
            <div className="rounded-xl bg-paper p-4">
              <h3 className="mb-2 font-black text-ink-900">اطلاعات تماس</h3>
              <p className="text-ink-700">
                {contact.name} — <span dir="ltr">{contact.phone}</span>
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
            <div className="border-2 border-ink-900 bg-goldc p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-black text-ink-900">برآورد اولیه سفارش</h3>
                  <p className="mt-1 text-[10px] text-ink-700">
                    خدمات استعلامی و هزینه‌های نصب پس از بررسی کارشناس نهایی می‌شوند.
                  </p>
                </div>
                <strong className="text-lg text-ink-900">
                  {estimate > 0 ? `${Math.round(estimate).toLocaleString("fa-IR")} تومان` : "نیازمند استعلام"}
                </strong>
              </div>
            </div>
            <p className="text-xs leading-6 text-ink-700/60">
              با ثبت این سفارش، کارشناسان چاپ ایران‌زمین برای کنترل فایل و تأیید تولید
              با شما تماس می‌گیرند. مبلغ نمایش‌داده‌شده برآورد اولیه است و
              پس از بررسی فایل، متریال و جزئیات اجرا نهایی می‌شود.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}
        {authRequired && (
          <div className="mt-5 border-2 border-ink-900 bg-goldc p-4 text-sm">
            <b>برای ثبت نهایی و پرداخت، ابتدا وارد حساب شوید.</b>
            <div className="mt-3 flex gap-2">
              <Link href="/login?next=%2Frequest" className="bg-ink-900 px-4 py-2 text-xs font-bold text-white">ورود</Link>
              <Link href="/register?next=%2Frequest" className="bg-reg px-4 py-2 text-xs font-bold text-white">ساخت حساب</Link>
            </div>
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
              {loading ? "در حال پردازش..." : "ادامه و پرداخت"}
            </button>
          )}
        </div>
      </div>
      <aside id="order-summary" className="border-2 border-ink-900 bg-white shadow-[5px_5px_0_0_#141414]">
        <div className="border-b-2 border-ink-900 bg-goldc p-4">
          <span className="block text-[10px] font-bold text-ink-700">مبلغ فعلی سبد</span>
          <strong className="mt-1 block text-xl text-ink-900">
            {estimate > 0
              ? `${Math.round(estimate).toLocaleString("fa-IR")} تومان`
              : "پس از انتخاب محاسبه می‌شود"}
          </strong>
        </div>
        <div className="space-y-3 p-4">
          <h2 className="text-xs font-black text-ink-900">سبد خرید شما</h2>
          {items.map((item, index) => (
            <div key={index} className="border-b border-ink-900/10 pb-3 text-[10px] last:border-0">
              <div className="flex justify-between gap-2">
                <b className="text-ink-900">{item.title || `آیتم ${(index + 1).toLocaleString("fa-IR")}`}</b>
                <span className="text-ink-700/60">× {item.quantity.toLocaleString("fa-IR")}</span>
              </div>
              {selectedOptionLabels(item).length > 0 && (
                <p className="mt-1 text-ink-700/60">
                  {selectedOptionLabels(item).join(" • ")}
                </p>
              )}
            </div>
          ))}
          <div className="space-y-1.5 border-t-2 border-ink-900/10 pt-3 text-[10px] text-ink-700">
            {extra.needsDesign && <div className="flex justify-between"><span>طراحی</span><b>+{ORDER_ADDON_PRICES.needsDesign.toLocaleString("fa-IR")}</b></div>}
          </div>
          <p className="border-t border-ink-900/10 pt-3 text-[9px] leading-5 text-ink-700/55">
            مبلغ نهایی پس از کنترل فایل و جزئیات تولید تأیید می‌شود.
          </p>
        </div>
      </aside>
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
