import type { NextRequest } from "next/server";
import { notImplementedPhpRoute } from "@/lib/php-backend";
import { STATIC_SERVICES } from "@/lib/static-services";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const service = STATIC_SERVICES.find((item) => item.id === Number(id));
  if (!service) {
    return Response.json({ message: "خدمت یافت نشد." }, { status: 404 });
  }
  return Response.json({ service });
}

export function PATCH(_request: NextRequest) {
  return notImplementedPhpRoute(
    "ویرایش خدمات باید در بک‌اند PHP پیاده‌سازی شود."
  );
}
