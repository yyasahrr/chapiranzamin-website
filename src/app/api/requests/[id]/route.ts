import { NextRequest } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  organizations,
  requestMessages,
  serviceRequestItems,
  serviceRequests,
  users,
} from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return Response.json({ message: "ابتدا وارد شوید." }, { status: 401 });

  const { id } = await params;
  const requestId = Number(id);
  if (!Number.isInteger(requestId))
    return Response.json({ message: "شناسه نامعتبر است." }, { status: 400 });

  const [request] = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.id, requestId))
    .limit(1);

  if (!request)
    return Response.json({ message: "درخواست یافت نشد." }, { status: 404 });

  const isAdmin = user.role === "admin";
  if (!isAdmin && request.userId !== user.id)
    return Response.json({ message: "دسترسی غیرمجاز." }, { status: 403 });

  const items = await db
    .select()
    .from(serviceRequestItems)
    .where(eq(serviceRequestItems.serviceRequestId, requestId));

  const messages = await db
    .select({
      id: requestMessages.id,
      message: requestMessages.message,
      senderRole: requestMessages.senderRole,
      senderName: users.name,
      createdAt: requestMessages.createdAt,
    })
    .from(requestMessages)
    .innerJoin(users, eq(requestMessages.senderId, users.id))
    .where(eq(requestMessages.serviceRequestId, requestId))
    .orderBy(asc(requestMessages.createdAt));

  let organization = null;
  if (request.organizationId) {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, request.organizationId))
      .limit(1);
    organization = org ?? null;
  }

  // یادداشت‌های داخلی ادمین هرگز به مشتری برنمی‌گردد
  const { adminNotes, ...safeRequest } = request;

  return Response.json({
    request: isAdmin ? request : safeRequest,
    items,
    messages,
    organization,
  });
}
