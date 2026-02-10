import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = { userId: session!.user.id };
  if (status) where.status = status;

  const requests = await prisma.cancellationRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      subscription: {
        select: {
          id: true,
          merchantName: true,
          displayName: true,
          amount: true,
          frequency: true,
          category: true,
        },
      },
    },
  });

  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { subscriptionId, method, notes } = body as {
      subscriptionId?: string;
      method?: string;
      notes?: string;
    };

    if (!subscriptionId || !method) {
      return NextResponse.json(
        { error: "subscriptionId et method sont requis" },
        { status: 400 }
      );
    }

    const validMethods = ["EMAIL", "PHONE", "LETTER", "ONLINE"];
    if (!validMethods.includes(method)) {
      return NextResponse.json(
        { error: "Méthode invalide. Valeurs acceptées : EMAIL, PHONE, LETTER, ONLINE" },
        { status: 400 }
      );
    }

    // Verify subscription belongs to user
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription || subscription.userId !== session!.user.id) {
      return NextResponse.json(
        { error: "Abonnement non trouvé" },
        { status: 404 }
      );
    }

    const cancellationRequest = await prisma.cancellationRequest.create({
      data: {
        userId: session!.user.id,
        subscriptionId,
        status: "PENDING",
        method,
        notes: notes ?? null,
      },
    });

    return NextResponse.json(cancellationRequest, { status: 201 });
  } catch (err) {
    console.error("Create cancellation request error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la création de la demande" },
      { status: 500 }
    );
  }
}
