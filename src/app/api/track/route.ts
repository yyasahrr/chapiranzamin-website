import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { serviceRequestItems, serviceRequests } from "@/db/schema";

export const dynamic = "force-dynamic";

// رهگیری عمومی درخواست با کد رهگیری + شماره موبایل ثبت‌شده
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.trim().toUpperCase() ?? "";
  const phone = req.nextUrl.searchParams.get("phone")?.trim() ?? "";

  if (!code || !phone)
    return Response.json(
      { message: "کد رهگیری و شماره موبایل الزامی است." },
      { status: 422 }
    );

  const [request] = await db
    .select({
      trackingCode: serviceRequests.trackingCode,
      status: serviceRequests.status,
      requestType: serviceRequests.requestType,
      createdAt: serviceRequests.createdAt,
      meetingScheduledAt: serviceRequests.meetingScheduledAt,
      contactName: serviceRequests.contactName,
      id: serviceRequests.id,
    })
    .from(serviceRequests)
    .where(
      and(
        eq(serviceRequests.trackingCode, code),
        eq(serviceRequests.contactPhone, phone)
      )
    )
    .limit(1);

  if (!request)
    return Response.json(
      { message: "درخواستی با این مشخصات یافت نشد." },
      { status: 404 }
    );

  const items = await db
    .select({
      title: serviceRequestItems.title,
      category: serviceRequestItems.category,
      quantity: serviceRequestItems.quantity,
    })
    .from(serviceRequestItems)
    .where(eq(serviceRequestItems.serviceRequestId, request.id));

  const { id, ...safe } = request;
  void id;
  return Response.json({ request: safe, items });
}
