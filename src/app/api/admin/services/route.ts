import type { NextRequest } from "next/server";
import { notImplementedPhpRoute } from "@/lib/php-backend";
import { STATIC_SERVICES } from "@/lib/static-services";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ services: STATIC_SERVICES });
}

export function POST(_request: NextRequest) {
  return notImplementedPhpRoute(
    "مدیریت خدمات باید در بک‌اند PHP پیاده‌سازی شود."
  );
}
