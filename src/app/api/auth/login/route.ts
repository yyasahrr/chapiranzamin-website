import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, publicUser, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = String(body.phone ?? "").trim();
    const password = String(body.password ?? "");

    const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return Response.json(
        { message: "شماره موبایل یا رمز عبور اشتباه است." },
        { status: 401 }
      );
    }

    await createSession(user.id);
    return Response.json({ user: publicUser(user) });
  } catch {
    return Response.json({ message: "خطای سرور رخ داد." }, { status: 500 });
  }
}
