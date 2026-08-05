"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  STATUS_LABELS,
  formatDate,
  formatDateTime,
} from "@/lib/constants";
import { readApiResponse } from "@/lib/client-api";

type Me = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  emailOptIn: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
};
type Order = {
  id: number;
  trackingCode: string;
  requestType: string;
  status: string;
  priority: string;
  createdAt: string;
  meetingScheduledAt: string | null;
  itemCount: number;
  messageCount: number;
  estimatedTotal: string;
  finalTotal: string | null;
  desiredDeliveryDate: string | null;
  shippingMethod: "pickup" | "courier" | "post";
  deliveryAddress: string | null;
  shippingTrackingCode: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
};
type Invoice = {
  id: number;
  invoiceNumber: string;
  total: string;
  status: string;
  dueAt: string | null;
  createdAt: string;
};
type Notice = {
  id: number;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};
type Meeting = {
  id: number;
  trackingCode: string;
  meetingScheduledAt: string;
};
type RecentMessage = {
  id: number;
  requestId: number;
  trackingCode: string;
  message: string;
  senderName: string;
  senderRole: string;
  createdAt: string;
};
type Metrics = {
  activeOrders: number;
  completedOrders: number;
  totalValue: number;
  unpaidInvoices: number;
  unreadNotifications: number;
};

const steps = [
  ["ثبت سفارش", "▣"],
  ["بررسی فایل", "⌕"],
  ["در حال تولید", "⚙"],
  ["آماده ارسال", "□"],
  ["ارسال‌شده", "⇢"],
  ["تحویل", "✓"],
] as const;
const statusStep: Record<string, number> = {
  new: 0,
  under_review: 1,
  contacted: 1,
  meeting_scheduled: 1,
  proposal_sent: 1,
  contracted: 1,
  in_production: 2,
  ready_to_ship: 3,
  shipped: 4,
  delivered: 5,
  completed: 5,
  cancelled: 0,
};

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    activeOrders: 0,
    completedOrders: 0,
    totalValue: 0,
    unpaidInvoices: 0,
    unreadNotifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileEmailOptIn, setProfileEmailOptIn] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState<"all" | "active" | "completed">(
    "all"
  );

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/dashboard/overview", {
          cache: "no-store",
          credentials: "same-origin",
        });
        if (response.status === 401) return router.replace("/login");
        if (response.status === 403) return router.replace("/admin");
        const data = await readApiResponse<{
          message?: string;
          user: Me;
          orders: Order[];
          invoices: Invoice[];
          notifications: Notice[];
          upcomingMeetings: Meeting[];
          recentMessages: RecentMessage[];
          metrics: Metrics;
        }>(response);
        setMe(data.user);
        setProfileName(data.user?.name ?? "");
        setProfileEmail(data.user?.email ?? "");
        setProfileEmailOptIn(data.user?.emailOptIn ?? false);
        setOrders(data.orders);
        setInvoices(data.invoices);
        setNotices(data.notifications);
        setMeetings(data.upcomingMeetings);
        setRecentMessages(data.recentMessages);
        setMetrics(data.metrics);
      } catch (error) {
        setDashboardError(
          error instanceof Error
            ? error.message
            : "دریافت اطلاعات داشبورد ناموفق بود."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  async function markNoticeRead(id: number) {
    const response = await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    if (!response.ok) return;
    setNotices((current) =>
      current.map((notice) =>
        notice.id === id ? { ...notice, readAt: new Date().toISOString() } : notice
      )
    );
    setMetrics((current) => ({
      ...current,
      unreadNotifications: Math.max(0, current.unreadNotifications - 1),
    }));
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setProfileSaving(true);
    setProfileError("");
    try {
      const result = await readApiResponse<{ user: Me; message?: string }>(
        await fetch("/api/account/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: profileName,
            email: profileEmail,
            emailOptIn: profileEmailOptIn,
          }),
        })
      );
      setMe(result.user);
      setProfileOpen(false);
      setNavOpen(false);
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : "ذخیره مشخصات ناموفق بود."
      );
    } finally {
      setProfileSaving(false);
    }
  }

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchesQuery = order.trackingCode
          .toLowerCase()
          .includes(query.trim().toLowerCase());
        const matchesFilter =
          orderFilter === "all" ||
          (orderFilter === "active" &&
            !["completed", "delivered", "cancelled"].includes(order.status)) ||
          (orderFilter === "completed" &&
            ["completed", "delivered"].includes(order.status));
        return matchesQuery && matchesFilter;
      }),
    [orderFilter, orders, query]
  );

  if (loading)
    return <div className="grid min-h-screen place-items-center bg-[#f7f8fa] text-sm text-slate-500">در حال آماده‌سازی داشبورد...</div>;
  if (dashboardError)
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f8fa] px-4">
        <div className="max-w-md rounded-lg border border-red-200 bg-white p-6 text-center">
          <p className="text-sm font-black text-red-700">داشبورد بارگذاری نشد</p>
          <p className="mt-2 text-xs leading-6 text-slate-500">{dashboardError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-slate-950 px-4 py-2 text-xs font-bold text-white"
          >
            تلاش دوباره
          </button>
        </div>
      </div>
    );

  const latest = orders[0];
  const currentStep = latest ? statusStep[latest.status] ?? 0 : 0;

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-950" dir="rtl">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-950 text-sm font-black text-white">چ</span>
            <div><b className="block text-sm">چاپخانه</b><span className="block text-[9px] text-slate-400">Customer portal</span></div>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {[["داشبورد", "/dashboard"], ["سفارش جدید", "/request"], ["پیگیری", "/track"], ["پشتیبانی", latest ? `/dashboard/requests/${latest.id}` : "/contact"]].map(([label, href], index) => (
              <Link key={label} href={href} className={`rounded-md px-3 py-2 text-xs font-bold ${index === 0 ? "bg-slate-100" : "text-slate-500 hover:bg-slate-50"}`}>{label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="#notifications"
              aria-label={`${metrics.unreadNotifications} اعلان خوانده‌نشده`}
              className="relative grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-500"
            >
              ♢
              {metrics.unreadNotifications > 0 && (
                <span className="absolute -left-1 -top-1 min-w-4 rounded-full bg-red-500 px-1 text-center text-[8px] font-bold text-white">
                  {metrics.unreadNotifications.toLocaleString("fa-IR")}
                </span>
              )}
            </a>
            <button onClick={() => setNavOpen(!navOpen)} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-violet-100 text-[10px] font-black text-violet-700">{me?.name[0]}</span>
              <span className="hidden text-xs font-bold sm:block">{me?.name}</span>
              <span className="text-[9px] text-slate-400">⌄</span>
            </button>
          </div>
        </div>
      </header>

      {navOpen && (
        <div className="absolute left-4 top-14 z-20 w-44 rounded-lg border border-slate-200 bg-white p-2 text-xs shadow-xl">
          <p className="px-2 py-2 text-[10px] text-slate-400" dir="ltr">{me?.phone}</p>
          <button
            onClick={() => setProfileOpen(true)}
            className="w-full rounded px-2 py-2 text-right font-bold hover:bg-slate-50"
          >
            ویرایش مشخصات
          </button>
          <button onClick={logout} className="w-full rounded px-2 py-2 text-right font-bold text-red-600 hover:bg-red-50">خروج از حساب</button>
        </div>
      )}

      {profileOpen && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/40 px-4">
          <button
            className="absolute inset-0"
            onClick={() => setProfileOpen(false)}
            aria-label="بستن ویرایش مشخصات"
          />
          <form
            onSubmit={saveProfile}
            className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black">ویرایش مشخصات حساب</h2>
              <button type="button" onClick={() => setProfileOpen(false)}>
                ×
              </button>
            </div>
            <label className="mt-5 block text-xs font-bold">
              نام و نام خانوادگی
              <input
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                minLength={2}
                maxLength={100}
                required
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5"
              />
            </label>
            <label className="mt-4 block text-xs font-bold">
              ایمیل
              <input
                value={profileEmail}
                onChange={(event) => setProfileEmail(event.target.value)}
                type="email"
                dir="ltr"
                maxLength={254}
                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2.5"
                placeholder="name@example.com"
              />
            </label>
            <p className="mt-2 text-[10px] leading-5 text-slate-400">
              ایمیل شما فقط برای ارتباطات حساب و مواردی که اجازه داده‌اید استفاده می‌شود.
            </p>
            <label className="mt-3 flex items-start gap-2 text-xs leading-6 text-slate-600">
              <input
                type="checkbox"
                checked={profileEmailOptIn}
                onChange={(event) => setProfileEmailOptIn(event.target.checked)}
                disabled={!profileEmail.trim()}
                className="mt-1"
              />
              مایل هستم اطلاعیه‌ها و پیشنهادهای چاپخانه را با ایمیل دریافت کنم.
            </label>
            {profileError && (
              <p className="mt-3 rounded bg-red-50 p-2 text-xs text-red-700">
                {profileError}
              </p>
            )}
            <button
              disabled={profileSaving}
              className="mt-5 w-full rounded-md bg-slate-950 py-2.5 text-xs font-bold text-white disabled:opacity-50"
            >
              {profileSaving ? "در حال ذخیره..." : "ذخیره مشخصات"}
            </button>
          </form>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-violet-600">پرتال مشتریان</p>
            <h1 className="mt-1 text-2xl font-black">سلام {me?.name}، خوش آمدید</h1>
            <p className="mt-1 text-xs text-slate-500">سفارش‌ها، فایل‌ها و گفت‌وگوهای پروژه را یکجا مدیریت کنید.</p>
          </div>
          <Link href="/request" className="rounded-md bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-700">+ شروع سفارش جدید</Link>
        </div>
        {!me?.email && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div>
              <p className="text-xs font-black text-amber-900">ایمیل حساب شما تکمیل نشده است</p>
              <p className="mt-1 text-[10px] text-amber-700">
                برای دریافت اطلاعیه‌های سفارش، ایمیل خود را از طریق پشتیبانی ثبت کنید.
              </p>
            </div>
            <button
              onClick={() => setProfileOpen(true)}
              className="text-xs font-bold text-amber-900"
            >
              افزودن ایمیل ←
            </button>
          </div>
        )}
        {me && (!me.phoneVerified || (me.email && !me.emailVerified)) && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-cyan-200 bg-cyan-50 p-4">
            <div>
              <p className="text-xs font-black text-cyan-950">تأیید اطلاعات حساب تکمیل نشده است</p>
              <p className="mt-1 text-[10px] text-cyan-800">
                تأیید شماره و ایمیل برای امنیت حساب و دریافت اطلاعیه‌های مهم قابل انجام است.
              </p>
            </div>
            <Link href="/verify-account" className="text-xs font-bold text-cyan-950">
              تکمیل تأیید حساب ←
            </Link>
          </div>
        )}

        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["سفارش‌های فعال", metrics.activeOrders, "▣", "bg-violet-50 text-violet-700", "عدد"],
            ["تکمیل‌شده", metrics.completedOrders, "✓", "bg-emerald-50 text-emerald-700", "عدد"],
            ["ارزش سفارش‌ها", metrics.totalValue, "₮", "bg-cyan-50 text-cyan-700", "پول"],
            ["فاکتور پرداخت‌نشده", metrics.unpaidInvoices, "◷", "bg-amber-50 text-amber-700", "عدد"],
          ].map(([label, value, icon, color, kind]) => (
            <div key={String(label)} className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-5">
              <span className={`grid h-11 w-11 place-items-center rounded-lg text-lg ${color}`}>{icon}</span>
              <div><p className="text-xl font-black">{Number(value).toLocaleString("fa-IR")}{kind === "پول" && <small className="mr-1 text-[9px] text-slate-400">تومان</small>}</p><p className="text-[10px] text-slate-400">{label}</p></div>
            </div>
          ))}
        </div>

        {latest && (
          <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="h-1.5 bg-gradient-to-l from-red-500 via-violet-500 to-cyan-500" />
            <div className="p-5 md:p-6">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold text-violet-600">آخرین سفارش در حال پیگیری</p>
                <h2 className="mt-1 font-mono text-sm font-black" dir="ltr">{latest.trackingCode}</h2>
                <p className="mt-2 text-[10px] text-slate-400">
                  ثبت‌شده در {formatDate(latest.createdAt)}
                  {latest.desiredDeliveryDate ? ` • تحویل مورد انتظار ${formatDate(latest.desiredDeliveryDate)}` : ""}
                </p>
              </div>
              <Link href={`/dashboard/requests/${latest.id}`} className="text-xs font-bold text-violet-600">مشاهده جزئیات و پیام‌ها ←</Link>
            </div>
            <div className="mt-8 flex items-start overflow-x-auto pb-2">
              {steps.map(([label, icon], index) => (
                <div key={label} className="relative flex min-w-24 flex-1 flex-col items-center text-center">
                  {index > 0 && <span className={`absolute left-1/2 right-[-50%] top-3 h-0.5 ${index <= currentStep ? "bg-violet-600" : "bg-slate-200"}`} />}
                  <span className={`relative z-10 grid h-7 w-7 place-items-center rounded-full border-2 text-[9px] font-black ${index <= currentStep ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-300"}`}>{index < currentStep ? "✓" : icon}</span>
                  <span className={`mt-2 text-[9px] font-bold ${index <= currentStep ? "text-slate-700" : "text-slate-300"}`}>{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-[9px] text-slate-400">روش دریافت</p>
                <p className="mt-1 text-xs font-black">
                  {latest.shippingMethod === "courier" ? "پیک شهری" : latest.shippingMethod === "post" ? "ارسال پستی" : "تحویل حضوری"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4 sm:col-span-2">
                <p className="text-[9px] text-slate-400">آدرس تحویل</p>
                <p className="mt-1 line-clamp-2 text-xs font-bold leading-6">
                  {latest.deliveryAddress || "دریافت حضوری از مجموعه"}
                </p>
              </div>
              {latest.shippingTrackingCode && (
                <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 sm:col-span-3">
                  <p className="text-[9px] text-cyan-700">کد رهگیری مرسوله</p>
                  <p className="mt-1 font-mono text-sm font-black" dir="ltr">{latest.shippingTrackingCode}</p>
                </div>
              )}
            </div>
            </div>
          </section>
        )}

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_.7fr]">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div><h2 className="text-sm font-black">سفارش‌های من</h2><p className="mt-1 text-[10px] text-slate-400">تاریخچه درخواست‌ها و وضعیت فعلی</p></div>
              <Link href="/request" className="text-xs font-bold text-violet-600">سفارش جدید +</Link>
            </div>
            <div className="flex flex-wrap gap-2 border-b border-slate-100 p-3">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="جست‌وجوی کد رهگیری..."
                dir="ltr"
                className="h-9 min-w-48 flex-1 rounded-md border border-slate-200 px-3 text-xs outline-none focus:border-violet-400"
              />
              <div className="flex rounded-md border border-slate-200 p-0.5">
                {([
                  ["all", "همه"],
                  ["active", "فعال"],
                  ["completed", "تکمیل‌شده"],
                ] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setOrderFilter(key)}
                    className={`rounded px-3 py-1.5 text-[10px] font-bold ${
                      orderFilter === key
                        ? "bg-slate-950 text-white"
                        : "text-slate-500"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {orders.length ? (
              <div className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <Link key={order.id} href={`/dashboard/requests/${order.id}`} className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-slate-50">
                    <span className="grid h-9 w-9 place-items-center rounded-md bg-slate-100 text-slate-500">▣</span>
                    <div className="min-w-36 flex-1"><p className="font-mono text-xs font-black" dir="ltr">{order.trackingCode}</p><p className="mt-1 text-[9px] text-slate-400">{order.itemCount.toLocaleString("fa-IR")} آیتم • {order.messageCount.toLocaleString("fa-IR")} پیام • {formatDate(order.createdAt)}</p></div>
                    <div className="text-left"><span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700">{STATUS_LABELS[order.status]}</span><p className="mt-2 text-[10px] font-black">{Number(order.finalTotal ?? order.estimatedTotal) > 0 ? `${Number(order.finalTotal ?? order.estimatedTotal).toLocaleString("fa-IR")} تومان` : "در انتظار قیمت"}</p></div>
                    <span className="text-slate-300">←</span>
                  </Link>
                ))}
                {!filteredOrders.length && (
                  <p className="p-10 text-center text-xs text-slate-400">
                    سفارشی مطابق جست‌وجو پیدا نشد.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-12 text-center"><span className="text-4xl text-slate-200">▣</span><p className="mt-4 text-xs font-bold">هنوز سفارشی ندارید</p><Link href="/request" className="mt-3 inline-block text-xs font-bold text-violet-600">ثبت اولین سفارش ←</Link></div>
            )}
          </section>

          <div className="space-y-5">
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-black">دسترسی سریع</h2>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[["محاسبه قیمت", "/request", "◇"], ["پیام پروژه", latest ? `/dashboard/requests/${latest.id}` : "/request", "✉"], ["پشتیبانی", "/contact", "◉"], ["پیگیری عمومی", "/track", "⌕"]].map(([label, href, icon]) => (
                  <Link key={label} href={href} className="rounded-md border border-slate-200 p-3 text-center hover:border-violet-300 hover:bg-violet-50/40"><span className="block text-lg text-violet-600">{icon}</span><span className="mt-1 block text-[10px] font-bold">{label}</span></Link>
                ))}
              </div>
            </section>
            {meetings.length > 0 && (
              <section className="rounded-lg border border-violet-200 bg-violet-50 p-5">
                <h2 className="text-sm font-black text-violet-950">جلسه بعدی</h2>
                <p className="mt-2 text-xs font-bold text-violet-700">
                  {formatDateTime(meetings[0].meetingScheduledAt)}
                </p>
                <Link
                  href={`/dashboard/requests/${meetings[0].id}`}
                  className="mt-3 inline-block text-[10px] font-bold text-violet-700"
                >
                  سفارش {meetings[0].trackingCode} ←
                </Link>
              </section>
            )}
            <section className="rounded-lg bg-slate-950 p-5 text-white">
              <p className="text-xs font-black">به راهنمایی نیاز دارید؟</p>
              <p className="mt-2 text-[10px] leading-5 text-slate-400">کارشناسان ما برای انتخاب متریال و برآورد پروژه همراه شما هستند.</p>
              <Link href="/contact" className="mt-4 inline-block rounded bg-white px-3 py-2 text-[10px] font-bold text-slate-950">ارتباط با پشتیبانی</Link>
            </section>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-3">
          <section
            id="notifications"
            className="overflow-hidden rounded-lg border border-slate-200 bg-white"
          >
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-sm font-black">اعلان‌های من</h2>
              <p className="mt-1 text-[10px] text-slate-400">
                اطلاعیه‌های حساب و سفارش
              </p>
            </div>
            <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
              {notices.slice(0, 8).map((notice) => (
                <div
                  key={notice.id}
                  className={`p-4 ${notice.readAt ? "bg-white" : "bg-violet-50/50"}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        notice.readAt ? "bg-slate-200" : "bg-violet-600"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black">{notice.title}</p>
                      {notice.body && (
                        <p className="mt-1 line-clamp-2 text-[10px] leading-5 text-slate-500">
                          {notice.body}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[9px] text-slate-400">
                          {formatDateTime(notice.createdAt)}
                        </span>
                        {!notice.readAt && (
                          <button
                            onClick={() => markNoticeRead(notice.id)}
                            className="text-[9px] font-bold text-violet-600"
                          >
                            خواندم
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {!notices.length && (
                <p className="p-10 text-center text-xs text-slate-400">
                  اعلان جدیدی ندارید.
                </p>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-sm font-black">پیام‌های اخیر پروژه‌ها</h2>
              <p className="mt-1 text-[10px] text-slate-400">
                آخرین گفت‌وگوها با کارشناسان
              </p>
            </div>
            <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
              {recentMessages.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/requests/${item.requestId}`}
                  className="block p-4 hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold" dir="ltr">
                      {item.trackingCode}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {formatDateTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[10px] leading-5 text-slate-600">
                    {item.senderRole === "customer" ? "شما" : item.senderName}:{" "}
                    {item.message}
                  </p>
                </Link>
              ))}
              {!recentMessages.length && (
                <p className="p-10 text-center text-xs text-slate-400">
                  هنوز پیامی ثبت نشده است.
                </p>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-sm font-black">فاکتورها</h2>
              <p className="mt-1 text-[10px] text-slate-400">
                وضعیت مالی سفارش‌ها
              </p>
            </div>
            <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center gap-3 p-4">
                  <span className="grid h-9 w-9 place-items-center rounded-md bg-slate-100 text-slate-500">
                    ₮
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] font-bold" dir="ltr">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="mt-1 text-[10px] font-black">
                      {Number(invoice.total).toLocaleString("fa-IR")} تومان
                    </p>
                  </div>
                  <span
                    className={`rounded px-2 py-1 text-[9px] font-bold ${
                      invoice.status === "paid"
                        ? "bg-emerald-50 text-emerald-700"
                        : invoice.status === "overdue"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {invoice.status === "paid"
                      ? "پرداخت‌شده"
                      : invoice.status === "overdue"
                        ? "سررسید گذشته"
                        : invoice.status === "issued"
                          ? "صادرشده"
                          : "پیش‌نویس"}
                  </span>
                </div>
              ))}
              {!invoices.length && (
                <p className="p-10 text-center text-xs text-slate-400">
                  هنوز فاکتوری برای شما صادر نشده است.
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
