import type { NextRequest } from "next/server";
import { notImplementedPhpRoute } from "@/lib/php-backend";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET(_request: NextRequest) {
  return notImplementedPhpRoute(
    "دریافت فایل سفارش باید در بک‌اند PHP یا object storage مجزا پیاده‌سازی شود."
  );
}
