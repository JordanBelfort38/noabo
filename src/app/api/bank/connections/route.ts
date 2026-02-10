import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const connections = await prisma.bankConnection.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      bankAccounts: {
        select: {
          name: true,
          balance: true,
          currency: true,
        },
      },
    },
  });

  return NextResponse.json({ connections });
}
