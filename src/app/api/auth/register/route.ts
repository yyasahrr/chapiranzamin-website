import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, hashPassword, publicUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = body.email ? String(body.email).trim() : null;
    const password = String(body.password ?? "");

    if (!name || name.length < 2)
      return Response.json({ message: "نام معتبر وارد کنید." }, { status: 422 });
    if (!/^09\d{9}$/.test(phone))
      return Response.json(
        { message: "شماره موبایل باید با 09 شروع شود و ۱۱ رقم باشد." },
        { status: 422 }
      );
    if (password.length < 6)
      return Response.json(
        { message: "رمز عبور باید حداقل ۶ کاراکتر باشد." },
        { status: 422 }
      );

    const existing = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    if (existing.length > 0)
      return Response.json(
        { message: "این شماره موبایل قبلاً ثبت شده است." },
        { status: 422 }
      );

    const [user] = await db
      .insert(users)
      .values({ name, phone, email, role: "customer", passwordHash: hashPassword(password) })
      .returning();

    await createSession(user.id);
    return Response.json({ user: publicUser(user) }, { status: 201 });
  } catch {
    return Response.json({ message: "خطای سرور رخ داد." }, { status: 500 });
  }
}
