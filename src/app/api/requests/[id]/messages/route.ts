import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { requestMessages, serviceRequests } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return Response.json({ message: "ابتدا وارد شوید." }, { status: 401 });

  const { id } = await params;
  const requestId = Number(id);
  const body = await req.json();
  const message = String(body.message ?? "").trim();
  if (!message)
    return Response.json({ message: "متن پیام خالی است." }, { status: 422 });

  const [request] = await db
    .select()
    .from(serviceRequests)
    .where(eq(serviceRequests.id, requestId))
    .limit(1);
  if (!request)
    return Response.json({ message: "درخواست یافت نشد." }, { status: 404 });

  if (user.role !== "admin" && request.userId !== user.id)
    return Response.json({ message: "دسترسی غیرمجاز." }, { status: 403 });

  const [created] = await db
    .insert(requestMessages)
    .values({
      serviceRequestId: requestId,
      senderId: user.id,
      senderRole: user.role,
      message,
    })
    .returning();

  return Response.json({ message: created }, { status: 201 });
}
