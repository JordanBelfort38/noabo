import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEmailToken } from "@/lib/tokens";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/login?error=InvalidToken", request.url),
    );
  }

  const email = await verifyEmailToken(token);
  if (!email) {
    return NextResponse.redirect(
      new URL("/login?error=InvalidOrExpiredToken", request.url),
    );
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });

  return NextResponse.redirect(new URL("/login?verified=true", request.url));
}
