"use client";

import { useEffect, useState } from "react";
import { readApiResponse } from "@/lib/client-api";
import {
  calculateConfiguredPrice,
  parseFullPricingConfig,
  parsePricingConfig,
  resolveFieldPrice,
  resolvePricingOptions,
} from "@/lib/pricing";
import { MATERIALS } from "@/lib/constants";

type Service = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  pricingModel: "fixed" | "per_item" | "per_sqm" | "quote";
  basePrice: string;
  unitLabel: string;
  wizardConfig: string;
  pricingConfig: string;
};

type CartItem = {
  key: string;
  serviceId: number;
  category: string;
  title: string;
  quantity: number;
  width: string;
  height: string;
  dimensionUnit: "cm";
  material: string;
  requiresPermit: boolean;
  requiresInstallationTeam: boolean;
  selectedOptions: Record<string, string>;
  description: string;
  price: number;
  needsFile: boolean;
};

type UploadedFile = { token: string; name: string; size: number };

const input =
  "w-full border-2 border-ink-900 bg-white px-3 py-2.5 text-sm outline-none focus:border-cyanink";

export default function OrderQuickStart() {
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [material, setMaterial] = useState("");
  const [installation, setInstallation] = useState(false);
  const [permit, setPermit] = useState(false);
  const [description, setDescription] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [contact, setContact] = useState({
    name: "",
    phone: "",
    email: "",
    shippingMethod: "pickup",
    address: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    fetch("/api/services", { cache: "no-store" })
      .then((response) =>
        readApiResponse<{ services: Service[]; message?: string }>(response)
      )
      .then((data) => setServices(data.services.slice(0, 8)))
      .catch(() => setServices([]));
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = sessionStorage.getItem("home-order-checkout");
        if (saved) {
          const parsed = JSON.parse(saved) as {
            cart?: CartItem[];
            files?: UploadedFile[];
            contact?: typeof contact;
          };
          if (Array.isArray(parsed.cart)) setCart(parsed.cart);
          if (Array.isArray(parsed.files)) setFiles(parsed.files);
          if (parsed.contact) setContact(parsed.contact);
        }
      } catch {
        sessionStorage.removeItem("home-order-checkout");
      } finally {
        setRestored(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!restored) return;
    sessionStorage.setItem(
      "home-order-checkout",
      JSON.stringify({ cart, files, contact })
    );
  }, [cart, files, contact, restored]);

  const service = services.find((item) => item.id === selected) ?? null;
  const groups = parsePricingConfig(service?.pricingConfig);
  const quantityRules = parseFullPricingConfig(service?.pricingConfig).quantityRules;
  const wizard = (() => {
    try {
      return JSON.parse(service?.wizardConfig || "{}") as Record<string, boolean>;
    } catch {
      return {};
    }
  })();
  const options = service
    ? resolvePricingOptions(service.pricingConfig, selectedOptions)
    : { valid: false, adjustment: 0, resolved: [] };
  const estimate =
    service && service.pricingModel !== "quote" && options.valid
      ? calculateConfiguredPrice(
          service.pricingModel,
          service.basePrice,
          {
            quantity,
            width: Number(width) || null,
            height: Number(height) || null,
            dimensionUnit: "cm",
            material,
            requiresInstallationTeam: installation,
            requiresPermit: permit,
          },
          service.pricingConfig,
          options.adjustment
        ).estimatedPrice
      : 0;
  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const cartNeedsFile = cart.some((item) => item.needsFile);
  const hasDedicatedMaterial = groups.some((group) =>
    `${group.key} ${group.label}`.toLowerCase().match(/material|stock|متریال|جنس/)
  );

  function resetConfiguration(id: number) {
    const target = services.find((item) => item.id === id);
    setSelected(id);
    setConfigOpen(false);
    setActiveGroup(0);
    setSelectedOptions({});
    setQuantity(parseFullPricingConfig(target?.pricingConfig).quantityRules.min);
    setWidth("");
    setHeight("");
    setMaterial("");
    setInstallation(false);
    setPermit(false);
    setDescription("");
    setError("");
  }

  function openConfiguration() {
    if (!selected) return;
    setConfigOpen(true);
    window.setTimeout(
      () =>
        document
          .getElementById("home-order-config")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      50
    );
  }

  function addToCart() {
    if (!service) return;
    if (!options.valid) return setError("گزینه‌های این محصول را کامل انتخاب کنید.");
    if (quantity < quantityRules.min || quantity > quantityRules.max)
      return setError(
        `تیراژ باید بین ${quantityRules.min.toLocaleString("fa-IR")} و ${quantityRules.max.toLocaleString("fa-IR")} باشد.`
      );
    const needsArea =
      service.pricingModel === "per_sqm" ||
      parseFullPricingConfig(service.pricingConfig).calculationFactors.area.enabled;
    if (needsArea && (!Number(width) || !Number(height)))
      return setError("عرض و ارتفاع را برای محاسبه قیمت وارد کنید.");
    setError("");
    setCart((current) => [
      ...current,
      {
        key: crypto.randomUUID(),
        serviceId: service.id,
        category: service.category,
        title: service.name,
        quantity,
        width,
        height,
        dimensionUnit: "cm",
        material,
        requiresPermit: permit,
        requiresInstallationTeam: installation,
        selectedOptions,
        description,
        price: estimate,
        needsFile: wizard.fileUpload === true,
      },
    ]);
    setConfigOpen(false);
    window.setTimeout(
      () =>
        document
          .getElementById("home-cart")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      60
    );
  }

  async function uploadFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.set("file", file);
      const uploaded = await readApiResponse<UploadedFile & { message?: string }>(
        await fetch("/api/uploads/order-artwork", { method: "POST", body })
      );
      setFiles((current) => [...current, uploaded].slice(0, 5));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "آپلود ناموفق بود.");
    } finally {
      setUploading(false);
    }
  }

  async function submitOrder() {
    if (!cart.length) return setError("سبد خرید خالی است.");
    if (contact.name.trim().length < 2) return setError("نام تحویل‌گیرنده را وارد کنید.");
    if (!/^09\d{9}$/.test(contact.phone)) return setError("شماره موبایل معتبر وارد کنید.");
    if (contact.shippingMethod !== "pickup" && contact.address.trim().length < 10)
      return setError("آدرس کامل تحویل را وارد کنید.");
    setSubmitting(true);
    setError("");
    try {
      const session = await fetch("/api/auth/me", { cache: "no-store" });
      if (session.status === 401) {
        setAuthRequired(true);
        setSubmitting(false);
        return;
      }
      const result = await readApiResponse<{
        trackingCode: string;
        invoiceId: number;
        paymentRequired: boolean;
        message?: string;
      }>(
        await fetch("/api/requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestType: "personal",
            contactName: contact.name,
            contactPhone: contact.phone,
            contactEmail: contact.email || null,
            shippingMethod: contact.shippingMethod,
            deliveryAddress:
              contact.shippingMethod === "pickup" ? null : contact.address,
            artworkTokens: files.map((file) => file.token),
            items: cart.map(({ key: _key, price: _price, needsFile: _needsFile, ...item }) => item),
            needsConsultation: false,
          }),
        })
      );
      setTrackingCode(result.trackingCode);
      setInvoiceId(result.paymentRequired ? result.invoiceId : null);
      sessionStorage.removeItem("home-order-checkout");
      if (result.paymentRequired) await startPayment(result.invoiceId);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "ثبت سفارش ناموفق بود.");
    } finally {
      setSubmitting(false);
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
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "اتصال به درگاه پرداخت ناموفق بود."
      );
    }
  }

  if (trackingCode)
    return (
      <section className="border-y-2 border-ink-900 bg-paper py-20">
        <div className="mx-auto max-w-xl border-2 border-ink-900 bg-white p-8 text-center shadow-[7px_7px_0_0_#141414]">
          <span className="mx-auto grid h-14 w-14 place-items-center bg-emerald-100 text-2xl">✓</span>
          <h2 className="mt-5 text-2xl font-black text-ink-900">سفارش با موفقیت ثبت شد</h2>
          <p className="mt-3 text-xs text-ink-700/60">کد رهگیری سفارش</p>
          <p className="mt-2 font-mono text-2xl font-black text-cyanink" dir="ltr">{trackingCode}</p>
          {error && <p className="mt-4 bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}
          {invoiceId && (
            <button type="button" onClick={() => void startPayment(invoiceId)} className="mt-5 w-full border-2 border-ink-900 bg-reg p-3 text-sm font-black text-white">
              تلاش مجدد برای پرداخت
            </button>
          )}
        </div>
      </section>
    );

  return (
    <section className="border-y-2 border-ink-900 bg-paper py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <p className="text-xs font-black text-reg">سامانه ثبت سفارش آنلاین</p>
          <h2 className="mt-2 text-3xl font-black text-ink-900 md:text-4xl">
            انتخاب، پیکربندی و ثبت سفارش در همین صفحه
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-700/70">
            محصول را پیکربندی کنید، به سبد اضافه کنید، فایل لازم را بفرستید و سفارش را نهایی کنید.
          </p>
        </div>

        <div className="grid overflow-hidden border-2 border-ink-900 bg-white shadow-[7px_7px_0_0_#141414] lg:grid-cols-[240px_1fr]">
          <div className="border-b-2 border-ink-900 bg-ink-900 p-6 text-paper lg:border-b-0 lg:border-l-2">
            <span className="grid h-10 w-10 place-items-center border-2 border-goldc bg-reg font-black">۱</span>
            <h3 className="mt-5 text-xl font-black text-goldc">انتخاب محصول</h3>
            <p className="mt-3 text-xs leading-7 text-paper/60">
              خدمت موردنظر را انتخاب کنید؛ مراحل اختصاصی همان خدمت باز می‌شوند.
            </p>
          </div>
          <div className="p-4 md:p-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {services.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => resetConfiguration(item.id)}
                  className={`min-h-28 border-2 p-3 text-right ${
                    selected === item.id
                      ? "border-ink-900 bg-goldc shadow-[3px_3px_0_0_#141414]"
                      : "border-ink-900/20 bg-paper hover:border-cyanink"
                  }`}
                >
                  <b className="text-xs text-ink-900">{item.name}</b>
                  <span className="mt-3 block text-[9px] font-black text-reg">
                    {Number(item.basePrice)
                      ? `از ${Number(item.basePrice).toLocaleString("fa-IR")} تومان`
                      : "نیازمند بررسی"}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={!selected}
              onClick={openConfiguration}
              className="mt-5 w-full border-2 border-ink-900 bg-ink-900 px-6 py-3.5 text-sm font-black text-goldc disabled:opacity-35"
            >
              {selected ? "ادامه پیکربندی ↓" : "ابتدا محصول را انتخاب کنید"}
            </button>
          </div>
        </div>

        {configOpen && service && (
          <div id="home-order-config" className="scroll-mt-24 border-x-2 border-b-2 border-ink-900 bg-white p-5 shadow-[7px_7px_0_0_#141414] md:p-8">
            <div className="grid gap-7 lg:grid-cols-[1fr_290px]">
              <div>
                <p className="text-[10px] font-black text-reg">مرحله ۲ — مشخصات محصول</p>
                <h3 className="mt-1 text-xl font-black">{service.name}</h3>
                {groups.length > 0 && (
                  <div className="mt-6">
                    <div className="mb-5 flex gap-2 overflow-x-auto">
                      {groups.map((group, index) => (
                        <button
                          key={group.key}
                          type="button"
                          disabled={index > activeGroup}
                          onClick={() => setActiveGroup(index)}
                          className={`min-w-max rounded-full px-3 py-2 text-[10px] font-black ${
                            index === activeGroup
                              ? "bg-ink-900 text-goldc"
                              : selectedOptions[group.key]
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-300"
                          }`}
                        >
                          {selectedOptions[group.key] ? "✓ " : ""}{group.label}
                        </button>
                      ))}
                    </div>
                    {groups.map((group, index) => (
                      <div key={group.key} className={index === activeGroup ? "block" : "hidden"}>
                        <p className="mb-3 text-sm font-black">{group.label} را انتخاب کنید</p>
                        <div className="grid gap-2 sm:grid-cols-3">
                          {group.options.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setSelectedOptions({ ...selectedOptions, [group.key]: option.value });
                                if (group.key === "run" && /^\d+$/.test(option.value))
                                  setQuantity(Number(option.value));
                                if (index < groups.length - 1)
                                  window.setTimeout(() => setActiveGroup(index + 1), 180);
                              }}
                              className={`border-2 p-3 text-right text-xs font-bold ${
                                selectedOptions[group.key] === option.value
                                  ? "border-cyanink bg-cyanink/5 text-cyanink"
                                  : "border-ink-900/20 bg-paper"
                              }`}
                            >
                              {option.label}
                              <span className="mt-1 block text-[9px] font-normal opacity-60">
                                {option.priceAdjustment ? `+${option.priceAdjustment.toLocaleString("fa-IR")} تومان` : "قیمت پایه"}
                              </span>
                            </button>
                          ))}
                          {group.key === "run" && quantityRules.allowCustom && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOptions({ ...selectedOptions, [group.key]: "__custom__" });
                                setQuantity(Math.max(quantityRules.min, quantity));
                              }}
                              className={`border-2 p-3 text-right text-xs font-bold ${
                                selectedOptions[group.key] === "__custom__"
                                  ? "border-reg bg-reg/5 text-reg"
                                  : "border-dashed border-ink-900/30 bg-white"
                              }`}
                            >
                              تیراژ دلخواه
                              <span className="mt-1 block text-[9px] font-normal opacity-60">
                                ورود عدد بین {quantityRules.min.toLocaleString("fa-IR")} تا {quantityRules.max.toLocaleString("fa-IR")}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {(selectedOptions.run === "__custom__" ||
                    (wizard.quantity !== false &&
                      !groups.some((group) => group.key === "run"))) && (
                    <label className="text-xs font-bold">تعداد
                      <input
                        type="number"
                        min={quantityRules.min}
                        max={quantityRules.max}
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value) || quantityRules.min)}
                        className={`${input} mt-2`}
                      />
                      <span className="mt-1 block text-[9px] font-normal text-ink-700/50">
                        حداقل {quantityRules.min.toLocaleString("fa-IR")} — حداکثر {quantityRules.max.toLocaleString("fa-IR")}
                      </span>
                    </label>
                  )}
                  {wizard.dimensions !== false && (
                    <div className="grid grid-cols-2 gap-2 sm:col-span-2">
                      <label className="text-xs font-bold">عرض (سانتی‌متر)<input type="number" value={width} onChange={(e) => setWidth(e.target.value)} className={`${input} mt-2`} /></label>
                      <label className="text-xs font-bold">ارتفاع (سانتی‌متر)<input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={`${input} mt-2`} /></label>
                    </div>
                  )}
                  {wizard.material !== false && !hasDedicatedMaterial && (
                    <label className="text-xs font-bold">متریال
                      <select value={material} onChange={(e) => setMaterial(e.target.value)} className={`${input} mt-2`}>
                        <option value="">انتخاب کنید</option>
                        {MATERIALS.map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </label>
                  )}
                  {wizard.installation !== false && (
                    <label className="flex items-center gap-2 border-2 border-ink-900/20 bg-paper p-3 text-xs font-bold">
                      <input type="checkbox" checked={installation} onChange={(e) => setInstallation(e.target.checked)} />
                      نصب توسط مجموعه
                      <span className="mr-auto text-[10px] text-reg">+{resolveFieldPrice(service.pricingConfig, { requiresInstallationTeam: true }).toLocaleString("fa-IR")}</span>
                    </label>
                  )}
                  {wizard.permit !== false && (
                    <label className="flex items-center gap-2 border-2 border-ink-900/20 bg-paper p-3 text-xs font-bold">
                      <input type="checkbox" checked={permit} onChange={(e) => setPermit(e.target.checked)} />
                      پیگیری مجوز
                    </label>
                  )}
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="توضیحات سفارش (اختیاری)" className={`${input} sm:col-span-2`} />
                </div>
              </div>
              <aside className="border-2 border-ink-900 bg-paper p-5">
                <p className="text-[10px] text-ink-700/60">قیمت این آیتم</p>
                <strong className="mt-2 block text-2xl">
                  {estimate ? `${estimate.toLocaleString("fa-IR")} تومان` : service.pricingModel === "quote" ? "پس از بررسی" : "گزینه‌ها را کامل کنید"}
                </strong>
                <p className="mt-2 text-[10px]">تعداد: {quantity.toLocaleString("fa-IR")}</p>
                <button type="button" onClick={addToCart} className="brut-press mt-5 w-full border-2 border-ink-900 bg-reg px-4 py-3 text-xs font-black text-white shadow-[4px_4px_0_0_#141414]">
                  افزودن به سبد خرید
                </button>
              </aside>
            </div>
          </div>
        )}

        {cart.length > 0 && (
          <div id="home-cart" className="scroll-mt-24 mt-10 grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-6">
              <section className="border-2 border-ink-900 bg-white p-5 shadow-[5px_5px_0_0_#141414]">
                <p className="text-[10px] font-black text-reg">مرحله ۳</p>
                <h3 className="mt-1 text-xl font-black">سبد خرید</h3>
                <div className="mt-4 divide-y divide-ink-900/10">
                  {cart.map((item) => (
                    <div key={item.key} className="flex items-center gap-3 py-4">
                      <span className="grid h-10 w-10 place-items-center bg-paper text-sm">▣</span>
                      <div className="flex-1">
                        <b className="text-xs">{item.title}</b>
                        <p className="mt-1 text-[9px] text-ink-700/55">{item.quantity.toLocaleString("fa-IR")} عدد</p>
                      </div>
                      <b className="text-xs">{item.price ? `${item.price.toLocaleString("fa-IR")} تومان` : "استعلام"}</b>
                      <button type="button" onClick={() => setCart(cart.filter((entry) => entry.key !== item.key))} className="text-xs font-bold text-reg">حذف</button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => { setSelected(null); setConfigOpen(false); window.scrollBy({ top: -500, behavior: "smooth" }); }} className="mt-3 text-xs font-black text-cyanink">+ افزودن محصول دیگر</button>
              </section>

              {cartNeedsFile && (
                <section className="border-2 border-ink-900 bg-white p-5">
                  <p className="text-[10px] font-black text-reg">فایل موردنیاز سفارش</p>
                  <h3 className="mt-1 text-base font-black">آپلود طرح آماده</h3>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    disabled={uploading || files.length >= 5}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadFile(file);
                      event.currentTarget.value = "";
                    }}
                    className="mt-4 block w-full text-xs file:ml-3 file:border-0 file:bg-ink-900 file:px-4 file:py-2 file:font-bold file:text-white"
                  />
                  <p className="mt-2 text-[9px] text-ink-700/55">PDF، JPG یا PNG تا ۱۵ مگابایت؛ حداکثر ۵ فایل</p>
                  {files.map((file) => (
                    <div key={file.token} className="mt-2 flex justify-between text-xs">
                      <span>{file.name}</span>
                      <button type="button" onClick={() => setFiles(files.filter((entry) => entry.token !== file.token))} className="font-bold text-reg">حذف</button>
                    </div>
                  ))}
                </section>
              )}

              <section className="border-2 border-ink-900 bg-white p-5">
                <p className="text-[10px] font-black text-reg">مرحله ۴</p>
                <h3 className="mt-1 text-base font-black">اطلاعات تحویل</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input placeholder="نام و نام خانوادگی *" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} className={input} />
                  <input placeholder="شماره موبایل *" dir="ltr" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className={input} />
                  <input placeholder="ایمیل (اختیاری)" type="email" dir="ltr" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className={`${input} sm:col-span-2`} />
                  <select value={contact.shippingMethod} onChange={(e) => setContact({ ...contact, shippingMethod: e.target.value })} className={`${input} sm:col-span-2`}>
                    <option value="pickup">تحویل حضوری</option>
                    <option value="courier">پیک شهری</option>
                    <option value="post">ارسال پستی</option>
                  </select>
                  {contact.shippingMethod !== "pickup" && (
                    <textarea placeholder="آدرس کامل تحویل *" rows={3} value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} className={`${input} sm:col-span-2`} />
                  )}
                </div>
              </section>
            </div>

            <aside className="h-fit border-2 border-ink-900 bg-goldc p-5 shadow-[5px_5px_0_0_#141414] lg:sticky lg:top-20">
              <h3 className="text-base font-black">جمع سبد خرید</h3>
              <div className="mt-4 flex justify-between border-t border-ink-900/20 pt-4 text-sm">
                <span>{cart.length.toLocaleString("fa-IR")} آیتم</span>
                <b>{cartTotal ? `${cartTotal.toLocaleString("fa-IR")} تومان` : "نیازمند بررسی"}</b>
              </div>
              {error && <p className="mt-3 bg-red-50 p-3 text-[10px] font-bold text-red-700">{error}</p>}
              {authRequired && (
                <div className="mt-4 border-2 border-ink-900 bg-white p-4 text-center">
                  <p className="text-xs font-black">برای پرداخت وارد حساب شوید</p>
                  <p className="mt-2 text-[10px] leading-5 text-ink-700/60">سبد خرید شما در همین مرورگر حفظ می‌شود.</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <a href="/login?next=%2F%3Fcheckout%3D1" className="bg-ink-900 p-2 text-[10px] font-bold text-white">ورود</a>
                    <a href="/register?next=%2F%3Fcheckout%3D1" className="bg-reg p-2 text-[10px] font-bold text-white">ساخت حساب</a>
                  </div>
                </div>
              )}
              <button type="button" disabled={submitting || uploading} onClick={submitOrder} className="brut-press mt-5 w-full border-2 border-ink-900 bg-reg px-4 py-3 text-sm font-black text-white shadow-[4px_4px_0_0_#141414] disabled:opacity-50">
                {submitting ? "در حال پردازش..." : "ادامه و پرداخت"}
              </button>
            </aside>
          </div>
        )}
        {error && !cart.length && <p className="mt-5 border-2 border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}
      </div>
    </section>
  );
}
