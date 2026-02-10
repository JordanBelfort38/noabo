import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");

  const where: Record<string, unknown> = { userId: session!.user.id };
  if (status) where.status = status;
  if (category) where.category = category;

  const subscriptions = await prisma.subscription.findMany({
    where,
    orderBy: [{ status: "asc" }, { amount: "desc" }],
  });

  return NextResponse.json({ subscriptions });
}

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const {
      merchantName,
      displayName,
      amount,
      frequency,
      category,
      nextChargeDate,
      commitmentEndDate,
      notes,
    } = body as {
      merchantName?: string;
      displayName?: string;
      amount?: number;
      frequency?: string;
      category?: string;
      nextChargeDate?: string;
      commitmentEndDate?: string;
      notes?: string;
    };

    if (!merchantName || !amount || !frequency) {
      return NextResponse.json(
        { error: "merchantName, amount et frequency sont requis" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Le montant doit être positif" },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: session!.user.id,
        merchantName,
        displayName: displayName ?? merchantName,
        amount,
        frequency,
        category: category ?? null,
        status: "ACTIVE",
        confidence: 100, // Manual = confirmed
        nextChargeDate: nextChargeDate ? new Date(nextChargeDate) : null,
        commitmentEndDate: commitmentEndDate ? new Date(commitmentEndDate) : null,
        notes: notes ?? null,
        transactionIds: [],
      },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (err) {
    console.error("Create subscription error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'abonnement" },
      { status: 500 }
    );
  }
}
