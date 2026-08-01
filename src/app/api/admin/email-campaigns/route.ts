import type { NextRequest } from "next/server";
import { notImplementedPhpRoute } from "@/lib/php-backend";

export const dynamic = "force-dynamic";

export function GET(_request: NextRequest) {
  return Response.json({ campaigns: [] });
}

export function POST(_request: NextRequest) {
  return notImplementedPhpRoute(
    "کمپین ایمیل باید در بک‌اند PHP یا سرویس ایمیل مجزا پیاده‌سازی شود."
  );
}
