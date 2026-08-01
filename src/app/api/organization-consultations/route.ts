import type { NextRequest } from "next/server";
import { notImplementedPhpRoute } from "@/lib/php-backend";

export const dynamic = "force-dynamic";

export function POST(_request: NextRequest) {
  return notImplementedPhpRoute(
    "فرم همکاری سازمانی باید در بک‌اند PHP پیاده‌سازی شود."
  );
}
