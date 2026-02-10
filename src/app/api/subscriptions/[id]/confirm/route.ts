import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const existing = await prisma.subscription.findUnique({ where: { id } });
  if (!existing || existing.userId !== session!.user.id) {
    return NextResponse.json(
      { error: "Abonnement non trouvé" },
      { status: 404 }
    );
  }

  const updated = await prisma.subscription.update({
    where: { id },
    data: { confidence: 100 },
  });

  return NextResponse.json({
    message: "Abonnement confirmé",
    subscription: updated,
  });
}
