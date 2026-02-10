import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const req = await prisma.cancellationRequest.findUnique({
    where: { id },
    include: {
      subscription: true,
    },
  });

  if (!req || req.userId !== session!.user.id) {
    return NextResponse.json(
      { error: "Demande non trouvée" },
      { status: 404 }
    );
  }

  return NextResponse.json({ request: req });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const existing = await prisma.cancellationRequest.findUnique({ where: { id } });
  if (!existing || existing.userId !== session!.user.id) {
    return NextResponse.json(
      { error: "Demande non trouvée" },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const { status, sentAt, confirmedAt, effectiveDate, notes } = body as {
      status?: string;
      sentAt?: string | null;
      confirmedAt?: string | null;
      effectiveDate?: string | null;
      notes?: string | null;
    };

    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (sentAt !== undefined) data.sentAt = sentAt ? new Date(sentAt) : null;
    if (confirmedAt !== undefined) data.confirmedAt = confirmedAt ? new Date(confirmedAt) : null;
    if (effectiveDate !== undefined) data.effectiveDate = effectiveDate ? new Date(effectiveDate) : null;
    if (notes !== undefined) data.notes = notes;

    // If status is CONFIRMED, also update the subscription status
    if (status === "CONFIRMED") {
      data.confirmedAt = data.confirmedAt ?? new Date();
      await prisma.subscription.update({
        where: { id: existing.subscriptionId },
        data: { status: "CANCELED" },
      });
    }

    // If status is SENT, set sentAt
    if (status === "SENT" && !data.sentAt) {
      data.sentAt = new Date();
    }

    const updated = await prisma.cancellationRequest.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update cancellation request error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const existing = await prisma.cancellationRequest.findUnique({ where: { id } });
  if (!existing || existing.userId !== session!.user.id) {
    return NextResponse.json(
      { error: "Demande non trouvée" },
      { status: 404 }
    );
  }

  await prisma.cancellationRequest.delete({ where: { id } });

  return NextResponse.json({ message: "Demande supprimée" });
}
