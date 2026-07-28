import { NextRequest } from "next/server";
import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { organizations, serviceRequestItems, serviceRequests } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin")
    return Response.json(
      { message: "شما اجازه دسترسی به این بخش را ندارید." },
      { status: 403 }
    );

  const sp = req.nextUrl.searchParams;
  const status = sp.get("status");
  const requestType = sp.get("type");
  const search = sp.get("q")?.trim();

  const conditions: SQL[] = [];
  if (status) conditions.push(eq(serviceRequests.status, status as never));
  if (requestType)
    conditions.push(eq(serviceRequests.requestType, requestType as never));
  if (search) {
    const cond = or(
      ilike(serviceRequests.trackingCode, `%${search}%`),
      ilike(serviceRequests.contactName, `%${search}%`),
      ilike(serviceRequests.contactPhone, `%${search}%`)
    );
    if (cond) conditions.push(cond);
  }

  const rows = await db
    .select({
      id: serviceRequests.id,
      trackingCode: serviceRequests.trackingCode,
      contactName: serviceRequests.contactName,
      contactPhone: serviceRequests.contactPhone,
      requestType: serviceRequests.requestType,
      status: serviceRequests.status,
      priority: serviceRequests.priority,
      createdAt: serviceRequests.createdAt,
      meetingScheduledAt: serviceRequests.meetingScheduledAt,
      organizationName: organizations.name,
      itemCount: sql<number>`(select count(*)::int from ${serviceRequestItems} where ${serviceRequestItems.serviceRequestId} = ${serviceRequests.id})`,
    })
    .from(serviceRequests)
    .leftJoin(organizations, eq(serviceRequests.organizationId, organizations.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(serviceRequests.createdAt))
    .limit(200);

  return Response.json({ requests: rows });
}
