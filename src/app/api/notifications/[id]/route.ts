import type { NextRequest } from "next/server";
import { notImplementedPhpRoute } from "@/lib/php-backend";

export const dynamic = "force-dynamic";

export function PATCH(_request: NextRequest) {
  return notImplementedPhpRoute(
    "اعلان‌های داخلی باید در بک‌اند PHP پیاده‌سازی شوند."
  );
}
