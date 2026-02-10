import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { resetPasswordSchema } from "@/lib/validations";
import { verifyPasswordResetToken } from "@/lib/tokens";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = rateLimit(`reset:${ip}`, {
    limit: 5,
    windowSeconds: 900,
  });
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const email = await verifyPasswordResetToken(parsed.data.token);
  if (!email) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 },
    );
  }

  const hashedPassword = await hashPassword(parsed.data.password);
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  return NextResponse.json({ message: "Password reset successful" });
}
