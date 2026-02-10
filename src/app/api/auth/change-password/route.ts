import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { changePasswordSchema } from "@/lib/validations";
import { hashPassword, verifyPassword } from "@/lib/password";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = rateLimit(`change-pwd:${ip}`, {
    limit: 5,
    windowSeconds: 900,
  });
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { password: true },
  });

  if (!user?.password) {
    return NextResponse.json(
      { error: "Cannot change password for OAuth accounts" },
      { status: 400 },
    );
  }

  const isValid = await verifyPassword(parsed.data.currentPassword, user.password);
  if (!isValid) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 400 },
    );
  }

  const hashedPassword = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: session!.user.id },
    data: { password: hashedPassword },
  });

  return NextResponse.json({ message: "Password changed successfully" });
}
