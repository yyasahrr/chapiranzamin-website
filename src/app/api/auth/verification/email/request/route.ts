import type { NextRequest } from "next/server";
import { notImplementedPhpRoute } from "@/lib/php-backend";

export const dynamic = "force-dynamic";

export function POST(_request: NextRequest) {
  return notImplementedPhpRoute(
    "ارسال کد تأیید ایمیل باید در بک‌اند PHP پیاده‌سازی شود."
  );
}
