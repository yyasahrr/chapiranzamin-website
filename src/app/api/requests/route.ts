import { NextRequest } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  organizations,
  serviceRequestItems,
  serviceRequests,
} from "@/db/schema";
import { generateTrackingCode, getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  "banner",
  "billboard",
  "urban_advertising",
  "poster",
  "brochure",
  "catalog",
  "sticker",
  "signage",
  "graphic_design",
  "other",
];

// ثبت درخواست جدید — هم برای مهمان، هم کاربر واردشده
export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const body = await req.json();

    const contactName = String(body.contactName ?? "").trim();
    const contactPhone = String(body.contactPhone ?? "").trim();
    const contactEmail = body.contactEmail ? String(body.contactEmail).trim() : null;
    const requestType = ["personal", "organization", "municipal"].includes(body.requestType)
      ? (body.requestType as "personal" | "organization" | "municipal")
      : "personal";

    if (!contactName || contactName.length < 2)
      return Response.json({ message: "نام تماس الزامی است." }, { status: 422 });
    if (!/^09\d{9}$/.test(contactPhone))
      return Response.json({ message: "شماره موبایل معتبر وارد کنید." }, { status: 422 });

    const rawItems: unknown[] = Array.isArray(body.items) ? body.items : [];
    const items = rawItems
      .map((raw) => {
        const it = raw as Record<string, unknown>;
        const category = CATEGORIES.includes(String(it.category))
          ? (String(it.category) as (typeof serviceRequestItems.$inferInsert)["category"])
          : null;
        const title = String(it.title ?? "").trim();
        if (!category || !title) return null;
        return {
          category,
          title,
          quantity: Math.max(1, Number(it.quantity) || 1),
          width: it.width ? String(Number(it.width)) : null,
          height: it.height ? String(Number(it.height)) : null,
          dimensionUnit: it.dimensionUnit === "m" ? ("m" as const) : ("cm" as const),
          material: it.material ? String(it.material) : null,
          installationLocation: it.installationLocation
            ? String(it.installationLocation)
            : null,
          installationAddress: it.installationAddress
            ? String(it.installationAddress)
            : null,
          requiresPermit: Boolean(it.requiresPermit),
          requiresInstallationTeam: Boolean(it.requiresInstallationTeam),
          description: it.description ? String(it.description) : null,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (items.length === 0)
      return Response.json(
        { message: "حداقل یک آیتم خدمت باید ثبت شود." },
        { status: 422 }
      );

    // در صورت سازمانی بودن، سازمان ثبت می‌شود
    let organizationId: number | null = null;
    if (requestType !== "personal" && body.organization?.name) {
      const org = body.organization;
      const [created] = await db
        .insert(organizations)
        .values({
          name: String(org.name).trim(),
          organizationType: org.organizationType ? String(org.organizationType) : null,
          registrationNumber: org.registrationNumber ? String(org.registrationNumber) : null,
          economicCode: org.economicCode ? String(org.economicCode) : null,
          phone: org.phone ? String(org.phone) : null,
          email: org.email ? String(org.email) : null,
          address: org.address ? String(org.address) : null,
          createdBy: user?.id ?? null,
        })
        .returning();
      organizationId = created.id;
    }

    // تولید کد رهگیری یکتا
    let trackingCode = generateTrackingCode();
    for (let i = 0; i < 5; i++) {
      const dup = await db
        .select({ id: serviceRequests.id })
        .from(serviceRequests)
        .where(eq(serviceRequests.trackingCode, trackingCode))
        .limit(1);
      if (dup.length === 0) break;
      trackingCode = generateTrackingCode();
    }

    const [request] = await db
      .insert(serviceRequests)
      .values({
        trackingCode,
        userId: user?.id ?? null,
        organizationId,
        requestType,
        contactName,
        contactPhone,
        contactEmail,
        desiredDeliveryDate: body.desiredDeliveryDate || null,
        needsConsultation: body.needsConsultation !== false,
        needsDesign: Boolean(body.needsDesign),
        needsInstallation: Boolean(body.needsInstallation),
        needsPermitFollowup: Boolean(body.needsPermitFollowup),
        description: body.description ? String(body.description) : null,
      })
      .returning();

    await db
      .insert(serviceRequestItems)
      .values(items.map((it) => ({ ...it, serviceRequestId: request.id })));

    return Response.json(
      { trackingCode: request.trackingCode, id: request.id },
      { status: 201 }
    );
  } catch {
    return Response.json({ message: "خطای سرور رخ داد." }, { status: 500 });
  }
}

// لیست درخواست‌های کاربر واردشده
export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ message: "ابتدا وارد شوید." }, { status: 401 });

  const rows = await db
    .select({
      id: serviceRequests.id,
      trackingCode: serviceRequests.trackingCode,
      requestType: serviceRequests.requestType,
      status: serviceRequests.status,
      priority: serviceRequests.priority,
      createdAt: serviceRequests.createdAt,
      meetingScheduledAt: serviceRequests.meetingScheduledAt,
      itemCount: sql<number>`(select count(*)::int from ${serviceRequestItems} where ${serviceRequestItems.serviceRequestId} = ${serviceRequests.id})`,
    })
    .from(serviceRequests)
    .where(eq(serviceRequests.userId, user.id))
    .orderBy(desc(serviceRequests.createdAt));

  return Response.json({ requests: rows });
}
