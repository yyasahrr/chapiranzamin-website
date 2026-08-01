"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { STATUS_LABELS, STATUS_ORDER, formatDate } from "@/lib/constants";
import { readApiResponse } from "@/lib/client-api";
import {
  parseFullPricingConfig,
  type PricingOptionGroup,
} from "@/lib/pricing";

type Data = {
  users: { id: number; name: string; phone: string; email: string | null; role: string; createdAt: string; orderCount: number }[];
  requests: { id: number; trackingCode: string; contactName: string; contactPhone: string; status: string; priority: string; createdAt: string }[];
  services: { id: number; slug: string; name: string; category: string; description: string | null; pricingModel: string; basePrice: string; unitLabel: string; active: boolean; featured: boolean; wizardConfig: string; pricingConfig: string }[];
  invoices: { id: number; invoiceNumber: string; total: string; status: string; createdAt: string }[];
  notifications: { id: number; title: string; body: string | null; type: string; readAt: string | null; createdAt: string }[];
  organizations: { id: number; name: string; organizationType: string | null; phone: string | null; status: string; createdAt: string }[];
  metrics: { users: number; openOrders: number; tickets: number; revenue: number };
};

const META: Record<string, [string, string]> = {
  tickets: ["تیکت‌های پشتیبانی", "گفت‌وگوها، SLA و پیگیری درخواست‌های مشتریان"],
  orders: ["مدیریت سفارش‌ها", "کنترل سفارش از ثبت اولیه تا تولید و تحویل"],
  workflow: ["گردش کار", "نمای کانبان مراحل فروش و عملیات"],
  services: ["خدمات و قیمت‌گذاری", "کاتالوگ خدمات، مدل محاسبه و قیمت پایه"],
  products: ["محصولات", "محصولات چاپی قابل سفارش و وضعیت انتشار"],
  finance: ["مالی و فاکتورها", "درآمد، مطالبات، فاکتورها و وضعیت پرداخت"],
  crm: ["مدیریت ارتباط مشتری", "نمای ۳۶۰ درجه مشتریان و سازمان‌ها"],
  users: ["مدیریت کاربران", "حساب‌ها، نقش‌ها و تاریخچه فعالیت"],
  analytics: ["گزارش‌ها و Analytics", "شاخص‌های فروش، تبدیل و عملکرد خدمات"],
  files: ["مدیریت فایل", "طرح‌ها، خروجی چاپ و فایل‌های تحویلی"],
  notifications: ["مرکز اعلان‌ها", "رویدادهای مهم و پیام‌های سیستمی"],
  emails: ["ایمیل همگانی", "ساخت کمپین، انتخاب مخاطب و گزارش وضعیت ارسال"],
  cms: ["مدیریت محتوا", "صفحات سایت، بنرها و محتوای قابل انتشار"],
  settings: ["تنظیمات", "پیکربندی عمومی، مالی، اعلان و امنیت"],
};

const money = (value: string | number) => `${Number(value).toLocaleString("fa-IR")} تومان`;

export default function AdminModule({ section }: { section: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");
  const [editingService, setEditingService] = useState<Data["services"][number] | null>(null);

  const load = useCallback(
    () =>
      fetch(`/api/admin/overview?section=${encodeURIComponent(section)}`, {
        cache: "no-store",
      })
        .then((response) => readApiResponse<Data & { message?: string }>(response))
        .then(setData)
        .catch(() => setError("بارگذاری این بخش ناموفق بود. دوباره تلاش کنید.")),
    [section]
  );

  useEffect(() => {
    if (!["cms", "emails"].includes(section)) void load();
  }, [load, section]);

  const [title, subtitle] = META[section] ?? ["ماژول مدیریت", "مرکز کنترل"];
  const requests = useMemo(
    () =>
      (data?.requests ?? []).filter((item) =>
        `${item.trackingCode} ${item.contactName} ${item.contactPhone}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [data, query]
  );

  async function toggleService(id: number, active: boolean) {
    await fetch(`/api/admin/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    await load();
  }

  async function toggleFeatured(id: number, featured: boolean) {
    await fetch(`/api/admin/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured }),
    });
    await load();
  }

  async function toggleWizardField(
    service: Data["services"][number],
    field: string
  ) {
    let config: Record<string, boolean> = {};
    try {
      config = JSON.parse(service.wizardConfig || "{}");
    } catch {}
    config[field] = config[field] === false;
    await fetch(`/api/admin/services/${service.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wizardConfig: config }),
    });
    await load();
  }

  async function createService(form: HTMLFormElement) {
    const formData = new FormData(form);
    await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    form.reset();
    setShowCreate(false);
    await load();
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
          {error}
        </div>
      )}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">Workspace / {section}</p>
          <h1 className="mt-1 text-2xl font-black">{title}</h1>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        {(section === "services" || section === "users") && (
          <button onClick={() => setShowCreate(!showCreate)} className="rounded-md bg-slate-950 px-4 py-2 text-xs font-bold text-white">
            {section === "services" ? "+ خدمت جدید" : "+ ساخت حساب"}
          </button>
        )}
      </div>

      {showCreate && section === "services" && (
        <form
          className="mb-5 grid gap-3 rounded-lg border border-violet-200 bg-violet-50/50 p-4 md:grid-cols-5"
          onSubmit={async (event) => {
            event.preventDefault();
            await createService(event.currentTarget);
          }}
        >
          <input required name="name" placeholder="نام خدمت" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none" />
          <input required name="slug" dir="ltr" placeholder="service-slug" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none" />
          <select name="pricingModel" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs">
            <option value="fixed">قیمت ثابت</option>
            <option value="per_item">براساس تعداد</option>
            <option value="per_sqm">متر مربع</option>
            <option value="quote">نیازمند استعلام</option>
          </select>
          <input name="basePrice" type="number" min="0" placeholder="قیمت پایه (تومان)" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs outline-none" />
          <button className="rounded-md bg-violet-600 px-3 py-2 text-xs font-bold text-white">ذخیره خدمت</button>
        </form>
      )}

      {showCreate && section === "users" && (
        <form
          className="mb-5 grid gap-3 rounded-lg border border-violet-200 bg-violet-50/50 p-4 md:grid-cols-5"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const response = await fetch("/api/admin/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(Object.fromEntries(new FormData(form))),
            });
            if (!response.ok) {
              const text = await response.text();
              let message = "ساخت حساب ناموفق بود.";
              try {
                message = JSON.parse(text).message || message;
              } catch {}
              setError(message);
              return;
            }
            form.reset();
            setShowCreate(false);
            await load();
          }}
        >
          <input required name="name" placeholder="نام و نام خانوادگی" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs" />
          <input required name="username" dir="ltr" placeholder="نام کاربری یا موبایل" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs" />
          <input required name="password" type="password" dir="ltr" minLength={8} placeholder="رمز عبور" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs" />
          <select name="role" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs">
            <option value="content_admin">مدیر محتوا</option>
            <option value="support">پشتیبان</option>
            <option value="admin">مدیر کل</option>
            <option value="customer">مشتری</option>
          </select>
          <button className="rounded-md bg-violet-600 px-3 py-2 text-xs font-bold text-white">ساخت و فعال‌سازی</button>
        </form>
      )}

      {(section === "orders" || section === "tickets") && (
        <>
          <Toolbar query={query} setQuery={setQuery} />
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full min-w-[720px] text-right text-xs">
              <thead className="bg-slate-50 text-[10px] text-slate-400">
                <tr><th className="px-5 py-3">شناسه</th><th className="px-4 py-3">مشتری</th><th className="px-4 py-3">وضعیت</th><th className="px-4 py-3">اولویت</th><th className="px-4 py-3">ایجاد</th><th /></tr>
              </thead>
              <tbody>
                {requests.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-mono font-bold" dir="ltr">{item.trackingCode}</td>
                    <td className="px-4 py-3.5"><b>{item.contactName}</b><span className="mt-0.5 block text-[10px] text-slate-400" dir="ltr">{item.contactPhone}</span></td>
                    <td className="px-4 py-3.5"><span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700">{STATUS_LABELS[item.status]}</span></td>
                    <td className="px-4 py-3.5">{item.priority === "urgent" ? "فوری" : item.priority === "high" ? "بالا" : "عادی"}</td>
                    <td className="px-4 py-3.5 text-slate-500">{formatDate(item.createdAt)}</td>
                    <td className="px-4"><Link href={`/admin/requests/${item.id}`} className="font-bold text-violet-600">{section === "tickets" ? "پاسخ" : "مدیریت"}</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {section === "workflow" && (
        <div className="grid gap-3 overflow-x-auto pb-3 md:grid-cols-3 xl:grid-cols-5">
          {STATUS_ORDER.slice(0, 5).map((status) => (
            <div key={status} className="min-w-[230px] rounded-lg bg-slate-100/70 p-2">
              <div className="mb-2 flex items-center justify-between px-1 py-2 text-xs font-bold">
                <span>{STATUS_LABELS[status]}</span>
                <span className="rounded bg-white px-1.5 text-[10px] text-slate-400">{requests.filter((r) => r.status === status).length}</span>
              </div>
              <div className="space-y-2">
                {requests.filter((r) => r.status === status).map((item) => (
                  <Link key={item.id} href={`/admin/requests/${item.id}`} className="block rounded-md border border-slate-200 bg-white p-3 shadow-sm">
                    <p className="font-mono text-[10px] font-bold" dir="ltr">{item.trackingCode}</p>
                    <p className="mt-2 text-xs font-bold">{item.contactName}</p>
                    <p className="mt-2 text-[9px] text-slate-400">{formatDate(item.createdAt)}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {section === "services" && (
        <>
        <div className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="text-sm font-black">مرکز طراحی خدمات و فرمول قیمت</h2>
            <p className="mt-2 text-[10px] leading-6 text-slate-500">
              هر خدمت یک فرمول مستقل دارد؛ ابتدا ساختار ویزارد، سپس عوامل قیمت و در پایان گزینه‌های جنس و تیراژ را تنظیم کنید.
            </p>
          </div>
          <div className="flex gap-2 text-[9px] font-bold text-slate-500">
            <span className="rounded bg-violet-50 px-3 py-2">۱. پایه</span>
            <span className="rounded bg-cyan-50 px-3 py-2">۲. عوامل</span>
            <span className="rounded bg-amber-50 px-3 py-2">۳. گزینه‌ها</span>
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {(data?.services ?? []).map((service) => (
            <article key={service.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-violet-50 text-xl text-violet-600">◇</span>
                <button
                  onClick={() => toggleService(service.id, !service.active)}
                  className={`relative h-5 w-9 rounded-full transition ${service.active ? "bg-emerald-500" : "bg-slate-300"}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${service.active ? "right-[18px]" : "right-0.5"}`} />
                </button>
              </div>
              <h2 className="mt-4 text-sm font-black">{service.name}</h2>
              <p className="mt-1 min-h-8 text-[10px] leading-5 text-slate-400">{service.description || "بدون توضیح"}</p>
              <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                <div><p className="text-[9px] text-slate-400">قیمت پایه</p><p className="mt-1 text-sm font-black">{Number(service.basePrice) ? money(service.basePrice) : "استعلام قیمت"}</p></div>
                <span className="rounded bg-slate-100 px-2 py-1 text-[9px] text-slate-500">{service.unitLabel}</span>
              </div>
              {(() => {
                const config = parseFullPricingConfig(service.pricingConfig);
                const activeFactors = Object.entries(config.calculationFactors)
                  .filter(([, factor]) => factor.enabled)
                  .map(([key]) => ({
                    quantity: "تعداد",
                    area: "مساحت",
                    material: "متریال",
                    installation: "نصب",
                    permit: "مجوز",
                  }[key]));
                return (
                  <div className="mt-3 rounded-lg bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center gap-1.5 text-[9px]">
                      <b className="ml-1 text-slate-600">فرمول فعال:</b>
                      <span className="rounded bg-white px-2 py-1 font-bold text-violet-700">
                        {service.pricingModel === "per_item"
                          ? "قیمت واحد × تیراژ"
                          : service.pricingModel === "per_sqm"
                            ? "مترمربع × ابعاد"
                            : service.pricingModel === "fixed"
                              ? "قیمت پایه"
                              : "استعلام"}
                      </span>
                      {activeFactors.map((factor) => factor && (
                        <span key={factor} className="rounded bg-white px-2 py-1 font-bold text-cyan-700">+ {factor}</span>
                      ))}
                      {config.optionGroups.length > 0 && (
                        <span className="rounded bg-white px-2 py-1 font-bold text-amber-700">
                          {config.optionGroups.length.toLocaleString("fa-IR")} گروه گزینه
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
              <div className="mt-4 border-t border-slate-100 pt-3">
                <label className="mb-3 flex items-center gap-2 text-[10px] font-bold text-slate-600">
                  <input
                    type="checkbox"
                    checked={service.featured}
                    onChange={(event) => toggleFeatured(service.id, event.target.checked)}
                  />
                  نمایش در خدمات صفحه اصلی
                </label>
                <p className="mb-2 text-[9px] font-bold text-slate-400">فیلدهای ویزارد</p>
                <div className="flex flex-wrap gap-1">
                  {[
                    ["dimensions", "ابعاد"],
                    ["quantity", "تعداد"],
                    ["material", "متریال"],
                    ["installation", "نصب"],
                    ["permit", "مجوز"],
                    ["fileUpload", "آپلود فایل"],
                    ["description", "توضیحات"],
                  ].map(([key, label]) => {
                    let enabled = true;
                    try {
                      enabled = JSON.parse(service.wizardConfig || "{}")[key] !== false;
                    } catch {}
                    return (
                      <button
                        key={key}
                        onClick={() => toggleWizardField(service, key)}
                        className={`rounded px-2 py-1 text-[9px] font-bold ${
                          enabled
                            ? "bg-violet-50 text-violet-700"
                            : "bg-slate-100 text-slate-400 line-through"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setEditingService(service)}
                  className="mt-4 w-full rounded-md bg-slate-950 px-3 py-2.5 text-[10px] font-bold text-white transition hover:bg-violet-700"
                >
                  بازکردن طراح خدمت و قیمت‌گذاری
                </button>
              </div>
            </article>
          ))}
        </div>
        {editingService && (
          <ServicePricingEditor
            service={editingService}
            onClose={() => setEditingService(null)}
            onSaved={async () => {
              setEditingService(null);
              await load();
            }}
          />
        )}
        </>
      )}

      {(section === "users" || section === "crm") && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[700px] text-right text-xs">
            <thead className="bg-slate-50 text-[10px] text-slate-400"><tr><th className="px-5 py-3">کاربر</th><th className="px-4">تماس</th><th className="px-4">نقش</th><th className="px-4">سفارش‌ها</th><th className="px-4">عضویت</th></tr></thead>
            <tbody>{(data?.users ?? []).map((user) => (
              <tr key={user.id} className="border-t border-slate-100">
                <td className="px-5 py-3.5"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 font-black">{user.name[0]}</span><b>{user.name}</b></div></td>
                <td className="px-4"><span dir="ltr">{user.phone}</span><span className="block text-[9px] text-slate-400">{user.email}</span></td>
                <td className="px-4"><span className="rounded bg-slate-100 px-2 py-1 text-[10px]">{user.role === "admin" ? "مدیر" : "مشتری"}</span></td>
                <td className="px-4 font-bold">{Number(user.orderCount).toLocaleString("fa-IR")}</td>
                <td className="px-4 text-slate-400">{formatDate(user.createdAt)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {section === "finance" && <Finance data={data} />}
      {section === "analytics" && <Analytics data={data} />}
      {section === "notifications" && <Notifications data={data} />}
      {section === "emails" && <EmailCampaignManager />}
      {section === "files" && <Files />}
      {section === "cms" && <BlogManager />}
      {section === "settings" && <Settings />}
    </div>
  );
}

function ServicePricingEditor({
  service,
  onClose,
  onSaved,
}: {
  service: Data["services"][number];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const parsed = parseFullPricingConfig(service.pricingConfig);
  const [name, setName] = useState(service.name);
  const [model, setModel] = useState(service.pricingModel);
  const [basePrice, setBasePrice] = useState(service.basePrice);
  const [unitLabel, setUnitLabel] = useState(service.unitLabel);
  const [groups, setGroups] = useState<PricingOptionGroup[]>(parsed.optionGroups);
  const [fieldPrices, setFieldPrices] = useState(parsed.fieldPrices);
  const [quantityRules, setQuantityRules] = useState(parsed.quantityRules);
  const [factors, setFactors] = useState(parsed.calculationFactors);
  const [wizard, setWizard] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(service.wizardConfig || "{}");
    } catch {
      return {};
    }
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const fields = [
    ["dimensions", "ابعاد (عرض × ارتفاع)"],
    ["quantity", "تعداد / تیراژ"],
    ["material", "فیلد متریال عمومی"],
    ["installation", "نصب و محل اجرا"],
    ["permit", "اخذ مجوز"],
    ["fileUpload", "آپلود فایل طرح"],
    ["description", "توضیحات تکمیلی"],
  ];

  function updateGroup(index: number, patch: Partial<PricingOptionGroup>) {
    setGroups((current) =>
      current.map((group, groupIndex) =>
        groupIndex === index ? { ...group, ...patch } : group
      )
    );
  }

  async function save() {
    setSaving(true);
    setMessage("");
    const normalizedGroups = groups.map((group, groupIndex) => ({
      ...group,
      key:
        group.key.trim().replace(/[^a-zA-Z0-9_-]/g, "") ||
        `group_${groupIndex + 1}`,
      label: group.label.trim(),
      options: group.options.map((option, optionIndex) => ({
        ...option,
        value:
          option.value.trim().replace(/[^a-zA-Z0-9_-]/g, "") ||
          `option_${optionIndex + 1}`,
        label: option.label.trim(),
        priceAdjustment: Math.round(Number(option.priceAdjustment) || 0),
      })),
    }));
    if (
      normalizedGroups.some(
        (group) =>
          !group.label ||
          group.options.length === 0 ||
          group.options.some((option) => !option.label)
      )
    ) {
      setMessage("هر گروه باید نام و حداقل یک گزینه معتبر داشته باشد.");
      setSaving(false);
      return;
    }
    try {
      await readApiResponse(
        await fetch(`/api/admin/services/${service.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            pricingModel: model,
            basePrice: Number(basePrice),
            unitLabel,
            wizardConfig: wizard,
            pricingConfig: {
              optionGroups: normalizedGroups,
              fieldPrices,
              quantityRules,
              calculationFactors: factors,
            },
          }),
        })
      );
      await onSaved();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ذخیره تنظیمات ناموفق بود.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/55 p-3 backdrop-blur-sm md:p-8">
      <div className="mx-auto max-w-6xl rounded-xl border border-slate-200 bg-[#f8fafc] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-xl border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-sm font-black">طراح قیمت و ویزارد</h2>
            <p className="mt-1 text-[10px] text-slate-400">
              محصول ← جنس و متریال ← تیراژ و ابعاد ← نصب و مجوز ← قیمت نهایی
            </p>
          </div>
          <button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md border border-slate-200">×</button>
        </div>

        <div className="border-b border-slate-200 bg-gradient-to-l from-violet-50 to-cyan-50 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
            <span className="rounded-full bg-violet-600 px-3 py-1.5 text-white">۱ قیمت پایه</span>
            <span className="text-slate-300">←</span>
            <span className="rounded-full bg-white px-3 py-1.5 text-slate-700">۲ فیلدهای ویزارد</span>
            <span className="text-slate-300">←</span>
            <span className="rounded-full bg-white px-3 py-1.5 text-slate-700">۳ عوامل محاسبه</span>
            <span className="text-slate-300">←</span>
            <span className="rounded-full bg-white px-3 py-1.5 text-slate-700">۴ جنس و تیراژ</span>
          </div>
        </div>
        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(300px,.85fr)_minmax(420px,1.35fr)]">
          <div className="space-y-5">
            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-xs font-black">۱. فرمول پایه</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="text-[10px] font-bold sm:col-span-2">نام خدمت
                  <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2 text-xs" />
                </label>
                <label className="text-[10px] font-bold">روش محاسبه
                  <select value={model} onChange={(e) => setModel(e.target.value)} className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2 text-xs">
                    <option value="fixed">ثابت برای سفارش</option>
                    <option value="per_item">قیمت واحد × تعداد</option>
                    <option value="per_sqm">قیمت مترمربع × ابعاد × تعداد</option>
                    <option value="quote">نیازمند استعلام</option>
                  </select>
                </label>
                <label className="text-[10px] font-bold">قیمت پایه (تومان)
                  <input type="number" min="0" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2 text-xs" />
                </label>
                <label className="text-[10px] font-bold sm:col-span-2">واحد نمایش
                  <input value={unitLabel} onChange={(e) => setUnitLabel(e.target.value)} placeholder="عدد، متر مربع، سفارش..." className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2 text-xs" />
                </label>
              </div>
              <div className="mt-4 rounded-md bg-violet-50 p-3 text-[10px] leading-5 text-violet-800">
                مثال: در مدل تعداد، قیمت هر گزینه به قیمت پایه هر واحد اضافه و سپس در تیراژ ضرب می‌شود.
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-xs font-black">۲. فیلدهای قابل نمایش</h3>
              <div className="mt-3 grid gap-2">
                {fields.map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-[10px] font-bold">
                    {label}
                    <input type="checkbox" checked={wizard[key] !== false} onChange={(e) => setWizard({ ...wizard, [key]: e.target.checked })} />
                  </label>
                ))}
              </div>
              {wizard.quantity !== false && (
                <div className="mt-4 rounded-md border border-cyan-100 bg-cyan-50/60 p-3">
                  <p className="text-[10px] font-black text-cyan-950">محدوده مجاز تیراژ</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <label className="text-[9px] font-bold text-slate-600">
                      حداقل تیراژ
                      <input
                        type="number"
                        min="1"
                        max={quantityRules.max}
                        value={quantityRules.min}
                        onChange={(event) => {
                          const min = Math.max(1, Math.min(100000, Number(event.target.value) || 1));
                          setQuantityRules({ ...quantityRules, min, max: Math.max(min, quantityRules.max) });
                        }}
                        className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs"
                      />
                    </label>
                    <label className="text-[9px] font-bold text-slate-600">
                      حداکثر تیراژ
                      <input
                        type="number"
                        min={quantityRules.min}
                        max="100000"
                        value={quantityRules.max}
                        onChange={(event) => {
                          const max = Math.max(quantityRules.min, Math.min(100000, Number(event.target.value) || quantityRules.min));
                          setQuantityRules({ ...quantityRules, max });
                        }}
                        className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs"
                      />
                    </label>
                  </div>
                  <label className="mt-3 flex items-center justify-between text-[10px] font-bold">
                    امکان ورود تیراژ دلخواه
                    <input
                      type="checkbox"
                      checked={quantityRules.allowCustom}
                      onChange={(event) => setQuantityRules({ ...quantityRules, allowCustom: event.target.checked })}
                    />
                  </label>
                </div>
              )}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-xs font-black">۳. عوامل مؤثر روی قیمت</h3>
              <p className="mt-1 text-[9px] leading-5 text-slate-400">
                هر عامل را فعال کنید؛ سپس مبلغ مربوط به همان عامل نمایش داده می‌شود.
              </p>
              <div className="mt-3 space-y-2">
                {([
                  ["quantity", "تعداد / تیراژ", "مبلغ هر عدد", "quantity"],
                  ["area", "ابعاد و مساحت", "مبلغ هر متر مربع", "dimensions"],
                  ["material", "انتخاب متریال", "افزایش قیمت متریال", "material"],
                  ["installation", "نصب و اجرا", "هزینه ثابت نصب", "installation"],
                  ["permit", "اخذ مجوز", "هزینه ثابت مجوز", "permit"],
                ] as const).map(([key, label, priceLabel, wizardKey]) => {
                  const factor = factors[key];
                  return (
                    <div key={key} className={`rounded-md border p-3 transition ${factor.enabled ? "border-violet-200 bg-violet-50/50" : "border-slate-100 bg-slate-50"}`}>
                      <label className="flex cursor-pointer items-center gap-2 text-[10px] font-bold">
                        <input
                          type="checkbox"
                          checked={factor.enabled}
                          onChange={(event) => {
                            const enabled = event.target.checked;
                            setFactors({ ...factors, [key]: { ...factor, enabled } });
                            if (enabled) setWizard({ ...wizard, [wizardKey]: true });
                          }}
                        />
                        {label}
                      </label>
                      {factor.enabled && (
                        <label className="mt-3 block text-[9px] font-bold text-slate-500">
                          {priceLabel} (تومان)
                          <input
                            type="number"
                            min="0"
                            value={factor.price}
                            onChange={(event) =>
                              setFactors({
                                ...factors,
                                [key]: {
                                  ...factor,
                                  price: Math.max(0, Number(event.target.value) || 0),
                                },
                              })
                            }
                            className="mt-1.5 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-950"
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 rounded-md bg-amber-50 p-3 text-[9px] leading-5 text-amber-800">
                مبلغ متریال زمانی اضافه می‌شود که مشتری از فیلد متریال یک گزینه انتخاب کند.
                برای قیمت متفاوت هر جنس، در بخش چهار گروه «جنس/متریال» بسازید.
              </p>
            </section>
          </div>

          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black">۴. گروه‌های انتخاب و افزایش قیمت</h3>
                <p className="mt-1 text-[9px] text-slate-400">برای جنس، روکش، رنگ، یک‌رو/دورو یا هر ویژگی دیگر</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setGroups([
                    ...groups,
                    {
                      key: `group_${groups.length + 1}`,
                      label: "گروه جدید",
                      required: true,
                      options: [{ value: "option_1", label: "گزینه اول", priceAdjustment: 0 }],
                    },
                  ])
                }
                className="rounded-md bg-violet-600 px-3 py-2 text-[10px] font-bold text-white"
              >
                + گروه
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {groups.map((group, groupIndex) => (
                <div key={`${group.key}-${groupIndex}`} className="rounded-lg border border-violet-100 bg-violet-50/40 p-3">
                  <div className="grid gap-2 sm:grid-cols-[1fr_130px_auto]">
                    <input value={group.label} onChange={(e) => updateGroup(groupIndex, { label: e.target.value })} placeholder="مثلاً جنس کاغذ" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold" />
                    <label className="flex items-center gap-2 rounded-md bg-white px-3 text-[10px] font-bold">
                      <input type="checkbox" checked={group.required} onChange={(e) => updateGroup(groupIndex, { required: e.target.checked })} />
                      اجباری
                    </label>
                    <button type="button" onClick={() => setGroups(groups.filter((_, index) => index !== groupIndex))} className="rounded-md px-2 text-[10px] font-bold text-red-600">حذف</button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {group.options.map((option, optionIndex) => (
                      <div key={`${option.value}-${optionIndex}`} className="grid gap-2 sm:grid-cols-[1fr_150px_auto]">
                        <input value={option.label} onChange={(e) => updateGroup(groupIndex, { options: group.options.map((item, index) => index === optionIndex ? { ...item, label: e.target.value } : item) })} placeholder="نام گزینه" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-[10px]" />
                        <input type="number" value={option.priceAdjustment} onChange={(e) => updateGroup(groupIndex, { options: group.options.map((item, index) => index === optionIndex ? { ...item, priceAdjustment: Number(e.target.value) || 0 } : item) })} placeholder="تغییر قیمت" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-[10px]" />
                        <button type="button" onClick={() => updateGroup(groupIndex, { options: group.options.filter((_, index) => index !== optionIndex) })} className="px-2 text-sm text-red-500">×</button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => updateGroup(groupIndex, { options: [...group.options, { value: `option_${group.options.length + 1}`, label: "", priceAdjustment: 0 }] })} className="mt-3 text-[10px] font-bold text-violet-700">+ افزودن گزینه</button>
                </div>
              ))}
              {!groups.length && (
                <div className="rounded-lg border-2 border-dashed border-slate-200 py-12 text-center text-[10px] text-slate-400">
                  این خدمت هنوز گزینه متغیر ندارد. برای جنس یا متریال، یک گروه بسازید.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 flex items-center justify-between rounded-b-xl border-t border-slate-200 bg-white px-5 py-4">
          <p className="text-[10px] font-bold text-red-600">{message}</p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-4 py-2 text-xs font-bold">انصراف</button>
            <button type="button" disabled={saving} onClick={save} className="rounded-md bg-slate-950 px-5 py-2 text-xs font-bold text-white disabled:opacity-50">
              {saving ? "در حال ذخیره..." : "ذخیره و اعمال در ویزارد"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toolbar({ query, setQuery }: { query: string; setQuery: (value: string) => void }) {
  return (
    <div className="mb-3 flex flex-wrap gap-2">
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جست‌وجو..." className="h-9 min-w-64 flex-1 rounded-md border border-slate-200 bg-white px-3 text-xs outline-none focus:border-violet-400" />
      <button disabled title="هنوز پیاده‌سازی نشده" className="rounded-md border border-slate-200 bg-slate-100 px-3 text-xs font-bold text-slate-400">فیلتر پیشرفته</button>
      <button disabled title="هنوز پیاده‌سازی نشده" className="rounded-md border border-slate-200 bg-slate-100 px-3 text-xs font-bold text-slate-400">خروجی CSV</button>
    </div>
  );
}

function Finance({ data }: { data: Data | null }) {
  return <div><div className="grid gap-3 md:grid-cols-3">{[["درآمد کل", money(data?.metrics.revenue ?? 0)], ["مطالبات", money(0)], ["فاکتورهای باز", (data?.invoices.filter((i) => i.status !== "paid").length ?? 0).toLocaleString("fa-IR")]].map(([a,b]) => <div key={a} className="rounded-lg border border-slate-200 bg-white p-5"><p className="text-xs text-slate-400">{a}</p><p className="mt-2 text-xl font-black">{b}</p></div>)}</div><div className="mt-4 rounded-lg border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">فاکتورها با نهایی‌شدن قیمت سفارش در این بخش نمایش داده می‌شوند.</div></div>;
}

function Analytics({ data }: { data: Data | null }) {
  const total = data?.requests.length ?? 0;
  const completed = data?.requests.filter((request) => request.status === "completed").length ?? 0;
  const cancelled = data?.requests.filter((request) => request.status === "cancelled").length ?? 0;
  const conversion = total ? Math.round((completed / total) * 100) : 0;
  const values = STATUS_ORDER.slice(0, 7).map((status) => {
    const count = data?.requests.filter((request) => request.status === status).length ?? 0;
    return total ? Math.max(4, Math.round((count / total) * 100)) : 4;
  });
  return <div className="grid gap-5 lg:grid-cols-[1.4fr_.7fr]"><div className="rounded-lg border border-slate-200 bg-white p-6"><h2 className="text-sm font-black">توزیع وضعیت سفارش‌ها</h2><div className="mt-8 flex h-64 items-end gap-3">{values.map((v,i)=><div key={i} className="flex-1 rounded-t bg-gradient-to-t from-violet-600 to-cyan-400" style={{height:`${v}%`}} />)}</div></div><div className="space-y-3">{[["کل سفارش‌ها",total.toLocaleString("fa-IR")],["تکمیل‌شده",completed.toLocaleString("fa-IR")],["نرخ تکمیل",`${conversion.toLocaleString("fa-IR")}٪`],["لغوشده",cancelled.toLocaleString("fa-IR")]].map(([a,b])=><div key={a} className="rounded-lg border border-slate-200 bg-white p-5"><p className="text-xs text-slate-400">{a}</p><p className="mt-2 text-2xl font-black">{b}</p></div>)}</div></div>;
}

function Notifications({ data }: { data: Data | null }) {
  return <div className="space-y-2">{(data?.notifications.length ? data.notifications : [{id:0,title:"مرکز اعلان‌ها آماده است",body:"رویدادهای سفارش، پرداخت و پیام مشتری در این بخش نمایش داده می‌شوند.",type:"info",readAt:null,createdAt:new Date().toISOString()}]).map((n)=><div key={n.id} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4"><span className="grid h-9 w-9 place-items-center rounded-full bg-violet-50 text-violet-600">♢</span><div><p className="text-xs font-black">{n.title}</p><p className="mt-1 text-[10px] text-slate-500">{n.body}</p><p className="mt-2 text-[9px] text-slate-400">{formatDate(n.createdAt)}</p></div></div>)}</div>;
}

type EmailCampaign = {
  id: number;
  subject: string;
  body: string;
  audience: "all" | "customers" | "staff";
  status: "draft" | "sending" | "sent" | "partial" | "failed";
  recipientCount: number;
  successCount: number;
  failedCount: number;
  createdAt: string;
  sentAt: string | null;
};

function EmailCampaignManager() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [counts, setCounts] = useState({ all: 0, customers: 0, staff: 0 });
  const [configured, setConfigured] = useState(false);
  const [audience, setAudience] =
    useState<EmailCampaign["audience"]>("customers");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [alsoNotify, setAlsoNotify] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    crypto.randomUUID()
  );

  const refresh = useCallback(async () => {
    try {
      const result = await readApiResponse<{
        configured: boolean;
        counts: typeof counts;
        campaigns: EmailCampaign[];
        message?: string;
      }>(
        await fetch("/api/admin/email-campaigns", { cache: "no-store" })
      );
      setConfigured(result.configured);
      setCounts(result.counts);
      setCampaigns(result.campaigns);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "دریافت کمپین‌ها ناموفق بود."
      );
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [refresh]);

  async function submit(sendNow: boolean) {
    if (
      sendNow &&
      !window.confirm(
        `این ایمیل برای ${counts[audience].toLocaleString("fa-IR")} گیرنده ارسال شود؟`
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await readApiResponse<{
        campaign: EmailCampaign;
        message?: string;
      }>(
        await fetch("/api/admin/email-campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject,
            body,
            audience,
            sendNow,
            alsoNotify,
            idempotencyKey,
          }),
        })
      );
      setMessage(
        sendNow
          ? `ارسال پایان یافت: ${result.campaign.successCount.toLocaleString("fa-IR")} موفق و ${result.campaign.failedCount.toLocaleString("fa-IR")} ناموفق.`
          : "کمپین به‌صورت پیش‌نویس ذخیره شد."
      );
      setSubject("");
      setBody("");
      setIdempotencyKey(crypto.randomUUID());
      await refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "ثبت کمپین ناموفق بود."
      );
    } finally {
      setBusy(false);
    }
  }

  const audienceLabels = {
    all: "همه کارکنان و مشتریان عضو خبرنامه",
    customers: "مشتریان عضو خبرنامه",
    staff: "کارکنان و مدیران",
  };
  const statusLabels: Record<EmailCampaign["status"], string> = {
    draft: "پیش‌نویس",
    sending: "در حال ارسال",
    sent: "ارسال‌شده",
    partial: "ارسال ناقص",
    failed: "ناموفق",
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_.85fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        {!configured && (
          <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-800">
            SMTP هنوز فعال نیست. ذخیره پیش‌نویس ممکن است، اما برای ارسال باید
            متغیرهای ایمیل در Environment تنظیم شوند.
          </div>
        )}
        {error && (
          <p className="mb-4 rounded-md bg-red-50 p-3 text-xs font-bold text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p className="mb-4 rounded-md bg-emerald-50 p-3 text-xs font-bold text-emerald-700">
            {message}
          </p>
        )}
        <label className="block text-xs font-bold">
          گروه مخاطبان
          <select
            value={audience}
            onChange={(event) =>
              setAudience(event.target.value as EmailCampaign["audience"])
            }
            className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5"
          >
            {Object.entries(audienceLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label} — {counts[key as keyof typeof counts].toLocaleString("fa-IR")} نفر
              </option>
            ))}
          </select>
        </label>
        <label className="mt-4 block text-xs font-bold">
          عنوان ایمیل
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            maxLength={150}
            className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5"
            placeholder="عنوان روشن و کوتاه"
          />
        </label>
        <label className="mt-4 block text-xs font-bold">
          متن پیام
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={20_000}
            rows={10}
            className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5 leading-7"
            placeholder="متن ایمیل را بنویسید..."
          />
        </label>
        <label className="mt-4 flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={alsoNotify}
            onChange={(event) => setAlsoNotify(event.target.checked)}
          />
          همین پیام در مرکز اعلان‌های کاربران نیز ثبت شود
        </label>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            disabled={busy || subject.trim().length < 3 || body.trim().length < 10}
            onClick={() => submit(false)}
            className="rounded-md border border-slate-200 px-4 py-2.5 text-xs font-bold disabled:opacity-40"
          >
            ذخیره پیش‌نویس
          </button>
          <button
            disabled={
              busy ||
              !configured ||
              counts[audience] === 0 ||
              subject.trim().length < 3 ||
              body.trim().length < 10
            }
            onClick={() => submit(true)}
            className="rounded-md bg-slate-950 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-40"
          >
            {busy
              ? "در حال پردازش..."
              : `ارسال برای ${counts[audience].toLocaleString("fa-IR")} نفر`}
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-black">تاریخچه کمپین‌ها</h2>
          <p className="mt-1 text-[10px] text-slate-400">
            حداکثر ۳۰ کمپین اخیر
          </p>
        </div>
        <div className="max-h-[650px] divide-y divide-slate-100 overflow-y-auto">
          {campaigns.map((campaign) => (
            <article key={campaign.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black">{campaign.subject}</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {audienceLabels[campaign.audience]} • {formatDate(campaign.createdAt)}
                  </p>
                </div>
                <span className="rounded bg-slate-100 px-2 py-1 text-[9px] font-bold">
                  {statusLabels[campaign.status]}
                </span>
              </div>
              <div className="mt-3 flex gap-4 text-[10px]">
                <span>گیرنده: {campaign.recipientCount.toLocaleString("fa-IR")}</span>
                <span className="text-emerald-600">
                  موفق: {campaign.successCount.toLocaleString("fa-IR")}
                </span>
                <span className="text-red-600">
                  ناموفق: {campaign.failedCount.toLocaleString("fa-IR")}
                </span>
              </div>
              {campaign.status === "draft" && (
                <button
                  onClick={() => {
                    setSubject(campaign.subject);
                    setBody(campaign.body);
                    setAudience(campaign.audience);
                    setIdempotencyKey(crypto.randomUUID());
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="mt-3 text-[10px] font-bold text-violet-600"
                >
                  بارگذاری برای ویرایش و ارسال
                </button>
              )}
            </article>
          ))}
          {!campaigns.length && (
            <p className="p-10 text-center text-xs text-slate-400">
              هنوز کمپینی ثبت نشده است.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Files() {
  return <div><div className="grid min-h-48 place-items-center rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 text-center"><span><b className="block text-sm text-amber-900">ذخیره‌ساز فایل هنوز متصل نشده است</b><small className="mt-2 block text-amber-700">برای جلوگیری از تصور آپلود موفق، انتخاب فایل غیرفعال است.</small></span></div><div className="mt-4 grid gap-3 sm:grid-cols-3">{["طرح‌های مشتری","فایل آماده چاپ","خروجی و تحویل"].map(x=><div key={x} className="rounded-lg border border-slate-200 bg-white p-5"><span className="text-2xl">▤</span><p className="mt-4 text-xs font-black">{x}</p><p className="mt-1 text-[10px] text-slate-400">زیرساخت موردنیاز</p></div>)}</div></div>;
}

function BlogManager() {
  const [posts, setPosts] = useState<{ id: number; title: string; slug: string; status: string; updatedAt: string }[]>([]);
  const [open, setOpen] = useState(false);
  const refresh = useCallback(
    () =>
      fetch("/api/admin/blog", { cache: "no-store" })
        .then((response) =>
          readApiResponse<{ posts: typeof posts; message?: string }>(response)
        )
        .then((data) => setPosts(data.posts ?? [])),
    []
  );
  useEffect(() => { void refresh(); }, [refresh]);
  return <div>
    <div className="mb-4 flex justify-end"><button onClick={() => setOpen(!open)} className="rounded-md bg-slate-950 px-4 py-2 text-xs font-bold text-white">+ نوشته جدید</button></div>
    {open && <form className="mb-5 space-y-3 rounded-lg border border-violet-200 bg-white p-5" onSubmit={async(e)=>{e.preventDefault();const form=e.currentTarget;await fetch("/api/admin/blog",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(new FormData(form)))});form.reset();setOpen(false);await refresh();}}>
      <div className="grid gap-3 md:grid-cols-2"><input required name="title" placeholder="عنوان مقاله" className="rounded-md border border-slate-200 px-3 py-2 text-xs"/><input required name="slug" dir="ltr" placeholder="article-slug" className="rounded-md border border-slate-200 px-3 py-2 text-xs"/></div>
      <input name="excerpt" placeholder="خلاصه مقاله" className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs"/>
      <textarea required name="content" rows={8} placeholder="متن کامل مقاله..." className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs leading-6"/>
      <div className="flex justify-between"><select name="status" className="rounded-md border border-slate-200 px-3 py-2 text-xs"><option value="draft">پیش‌نویس</option><option value="published">انتشار عمومی</option></select><button className="rounded-md bg-violet-600 px-5 py-2 text-xs font-bold text-white">ذخیره نوشته</button></div>
    </form>}
    <div className="grid gap-3 md:grid-cols-2">{posts.map((post)=><div key={post.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5"><div><p className="text-sm font-black">{post.title}</p><p className={`mt-1 text-[10px] ${post.status==="published"?"text-emerald-600":"text-amber-600"}`}>{post.status==="published"?"منتشرشده":"پیش‌نویس"} • /blog/{post.slug}</p></div><a target="_blank" href={`/blog/${post.slug}`} className="rounded border border-slate-200 px-3 py-1.5 text-[10px] font-bold">مشاهده</a></div>)}</div>
  </div>;
}

function Settings() {
  return <div className="grid gap-5 lg:grid-cols-[220px_1fr]"><div className="space-y-1 rounded-lg border border-slate-200 bg-white p-2">{["عمومی","اطلاعات تماس","مالی و مالیات","اعلان‌ها","امنیت و دسترسی","یکپارچه‌سازی‌ها"].map((x,i)=><button key={x} disabled className={`w-full rounded px-3 py-2 text-right text-xs font-bold ${i===0?"bg-slate-100":"text-slate-400"}`}>{x}</button>)}</div><div className="rounded-lg border border-amber-200 bg-amber-50 p-6"><h2 className="text-sm font-black text-amber-900">تنظیمات در حالت فقط‌نمایش</h2><p className="mt-3 text-xs leading-6 text-amber-800">API امن برای ویرایش تنظیمات کسب‌وکار هنوز پیاده‌سازی نشده است؛ کنترل‌های نمایشی قبلی حذف شدند تا ذخیره‌سازی غیرواقعی به کاربر اعلام نشود.</p></div></div>;
}
