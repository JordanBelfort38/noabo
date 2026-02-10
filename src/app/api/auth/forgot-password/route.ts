import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";
import { generatePasswordResetToken } from "@/lib/tokens";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = rateLimit(`forgot:${ip}`, {
    limit: 3,
    windowSeconds: 900,
  });
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Always return the same response to prevent email enumeration
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (user) {
    const token = await generatePasswordResetToken(parsed.data.email);

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[DEV] Reset URL: ${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/reset-password/${token}`,
      );
    }

    // TODO: Send reset email via SMTP
  }

  return NextResponse.json({
    message: "If an account exists, a reset link has been sent.",
  });
}
