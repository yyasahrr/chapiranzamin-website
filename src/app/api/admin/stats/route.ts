import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { organizations, serviceRequests, users } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin")
    return Response.json(
      { message: "شما اجازه دسترسی به این بخش را ندارید." },
      { status: 403 }
    );

  const byStatus = await db
    .select({
      status: serviceRequests.status,
      count: sql<number>`count(*)::int`,
    })
    .from(serviceRequests)
    .groupBy(serviceRequests.status);

  const [totals] = await db
    .select({
      totalRequests: sql<number>`count(*)::int`,
    })
    .from(serviceRequests);

  const [customerCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(eq(users.role, "customer"));

  const [orgCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(organizations);

  const recent = await db
    .select({
      id: serviceRequests.id,
      trackingCode: serviceRequests.trackingCode,
      contactName: serviceRequests.contactName,
      requestType: serviceRequests.requestType,
      status: serviceRequests.status,
      priority: serviceRequests.priority,
      createdAt: serviceRequests.createdAt,
    })
    .from(serviceRequests)
    .orderBy(desc(serviceRequests.createdAt))
    .limit(8);

  return Response.json({
    byStatus,
    totalRequests: totals?.totalRequests ?? 0,
    customerCount: customerCount?.count ?? 0,
    organizationCount: orgCount?.count ?? 0,
    recent,
  });
}
