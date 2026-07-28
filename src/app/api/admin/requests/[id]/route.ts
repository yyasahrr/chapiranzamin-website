import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { serviceRequests } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";

const STATUSES = [
  "new",
  "under_review",
  "contacted",
  "meeting_scheduled",
  "proposal_sent",
  "contracted",
  "in_production",
  "completed",
  "cancelled",
];
const PRIORITIES = ["normal", "high", "urgent"];

// به‌روزرسانی وضعیت، اولویت، جلسه و یادداشت داخلی توسط ادمین
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin")
    return Response.json(
      { message: "شما اجازه دسترسی به این بخش را ندارید." },
      { status: 403 }
    );

  const { id } = await params;
  const requestId = Number(id);
  const body = await req.json();

  const updates: Partial<typeof serviceRequests.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status))
      return Response.json({ message: "وضعیت نامعتبر است." }, { status: 422 });
    updates.status = body.status;
  }
  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority))
      return Response.json({ message: "اولویت نامعتبر است." }, { status: 422 });
    updates.priority = body.priority;
  }
  if (body.adminNotes !== undefined) {
    updates.adminNotes = body.adminNotes ? String(body.adminNotes) : null;
  }
  if (body.meetingScheduledAt !== undefined) {
    updates.meetingScheduledAt = body.meetingScheduledAt
      ? new Date(body.meetingScheduledAt)
      : null;
    if (body.meetingScheduledAt && body.status === undefined) {
      updates.status = "meeting_scheduled";
    }
  }

  const [updated] = await db
    .update(serviceRequests)
    .set(updates)
    .where(eq(serviceRequests.id, requestId))
    .returning();

  if (!updated)
    return Response.json({ message: "درخواست یافت نشد." }, { status: 404 });

  return Response.json({ request: updated });
}
