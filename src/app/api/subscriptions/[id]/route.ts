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

  const subscription = await prisma.subscription.findUnique({
    where: { id },
  });

  if (!subscription || subscription.userId !== session!.user.id) {
    return NextResponse.json(
      { error: "Abonnement non trouvé" },
      { status: 404 }
    );
  }

  // Fetch related transactions
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session!.user.id,
      merchantName: subscription.merchantName,
      amount: { lt: 0 },
    },
    orderBy: { date: "desc" },
    take: 20,
  });

  return NextResponse.json({ subscription, transactions });
}

export async function PATCH(
  request: Request,
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

  try {
    const body = await request.json();
    const {
      displayName,
      amount,
      frequency,
      category,
      status,
      nextChargeDate,
      commitmentEndDate,
      cancellationUrl,
      notes,
    } = body as {
      displayName?: string;
      amount?: number;
      frequency?: string;
      category?: string | null;
      status?: string;
      nextChargeDate?: string | null;
      commitmentEndDate?: string | null;
      cancellationUrl?: string | null;
      notes?: string | null;
    };

    const data: Record<string, unknown> = {};
    if (displayName !== undefined) data.displayName = displayName;
    if (amount !== undefined) data.amount = amount;
    if (frequency !== undefined) data.frequency = frequency;
    if (category !== undefined) data.category = category;
    if (status !== undefined) data.status = status;
    if (nextChargeDate !== undefined)
      data.nextChargeDate = nextChargeDate ? new Date(nextChargeDate) : null;
    if (commitmentEndDate !== undefined)
      data.commitmentEndDate = commitmentEndDate ? new Date(commitmentEndDate) : null;
    if (cancellationUrl !== undefined) data.cancellationUrl = cancellationUrl;
    if (notes !== undefined) data.notes = notes;

    const updated = await prisma.subscription.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update subscription error:", err);
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

  const existing = await prisma.subscription.findUnique({ where: { id } });
  if (!existing || existing.userId !== session!.user.id) {
    return NextResponse.json(
      { error: "Abonnement non trouvé" },
      { status: 404 }
    );
  }

  await prisma.subscription.delete({ where: { id } });

  return NextResponse.json({ message: "Abonnement supprimé" });
}
