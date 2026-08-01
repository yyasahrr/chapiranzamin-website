export const CATEGORY_LABELS: Record<string, string> = {
  banner: "بنر و فلکس",
  billboard: "بیلبورد",
  urban_advertising: "تبلیغات محیطی و شهری",
  poster: "پوستر",
  brochure: "بروشور",
  catalog: "کاتالوگ",
  sticker: "استیکر و برچسب",
  signage: "تابلو و سازه",
  graphic_design: "طراحی گرافیک",
  other: "سایر خدمات",
};

export const STATUS_LABELS: Record<string, string> = {
  new: "جدید",
  under_review: "در حال بررسی",
  contacted: "تماس گرفته شد",
  meeting_scheduled: "جلسه تنظیم شد",
  proposal_sent: "پیشنهاد ارسال شد",
  contracted: "قرارداد بسته شد",
  in_production: "در حال تولید",
  ready_to_ship: "آماده ارسال",
  shipped: "ارسال شده",
  delivered: "تحویل داده شده",
  completed: "تکمیل شده",
  cancelled: "لغو شده",
};

export const STATUS_COLORS: Record<string, string> = {
  new: "border border-ink-900 bg-blue-200 text-ink-900",
  under_review: "border border-ink-900 bg-amber-200 text-ink-900",
  contacted: "border border-ink-900 bg-cyan-200 text-ink-900",
  meeting_scheduled: "border border-ink-900 bg-purple-200 text-ink-900",
  proposal_sent: "border border-ink-900 bg-indigo-200 text-ink-900",
  contracted: "border border-ink-900 bg-goldc text-ink-900",
  in_production: "border border-ink-900 bg-orange-200 text-ink-900",
  ready_to_ship: "border border-ink-900 bg-sky-200 text-ink-900",
  shipped: "border border-ink-900 bg-blue-300 text-ink-900",
  delivered: "border border-ink-900 bg-emerald-300 text-ink-900",
  completed: "border border-ink-900 bg-green-300 text-ink-900",
  cancelled: "border border-ink-900 bg-red-300 text-ink-900",
};

export const STATUS_ORDER = [
  "new",
  "under_review",
  "contacted",
  "meeting_scheduled",
  "proposal_sent",
  "contracted",
  "in_production",
  "ready_to_ship",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
] as const;

export const PRIORITY_LABELS: Record<string, string> = {
  normal: "عادی",
  high: "بالا",
  urgent: "فوری",
};

export const REQUEST_TYPE_LABELS: Record<string, string> = {
  personal: "شخصی / کسب‌وکار",
  organization: "سازمانی",
  municipal: "شهری / شهرداری",
};

export const ORG_TYPES = [
  "دولتی",
  "شهرداری",
  "آموزشی و دانشگاهی",
  "صنعتی",
  "خصوصی",
  "فرهنگی و هنری",
  "درمانی",
  "سایر",
];

export const MATERIALS = [
  "وینیل",
  "مش",
  "فلکس",
  "بک‌لایت",
  "PVC",
  "استیکر",
  "پارچه",
  "کاغذ گلاسه",
  "سایر / نامشخص",
];

export const INSTALL_LOCATIONS = [
  "معبر شهری",
  "سردر سازمان",
  "فضای داخلی",
  "سازه تبلیغاتی",
  "نمای ساختمان",
  "سایر",
];

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function faNum(n: number | string): string {
  return Number(n).toLocaleString("fa-IR");
}
