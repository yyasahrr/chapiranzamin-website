import type { NextRequest } from "next/server";
import { notImplementedPhpRoute } from "@/lib/php-backend";

export const dynamic = "force-dynamic";

export function POST(_request: NextRequest) {
  return notImplementedPhpRoute(
    "پرداخت باید از مسیر بک‌اند PHP یا درگاه مستقل شما انجام شود."
  );
}
