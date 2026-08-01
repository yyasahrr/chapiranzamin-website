import type { NextRequest } from "next/server";
import { notImplementedPhpRoute } from "@/lib/php-backend";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function POST(_request: NextRequest) {
  return notImplementedPhpRoute(
    "آپلود فایل باید در بک‌اند PHP یا object storage مجزا پیاده‌سازی شود."
  );
}
