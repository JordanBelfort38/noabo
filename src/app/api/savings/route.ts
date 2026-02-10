import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { calculatePotentialSavings } from "@/lib/savings-calculator";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: session!.user.id },
    });

    const subsWithMerchant = subscriptions.map((s) => ({
      ...s,
      merchantName: s.merchantName,
    }));

    const savings = calculatePotentialSavings(subsWithMerchant);

    return NextResponse.json({
      suggestions: savings.suggestions.map((s) => ({
        subscriptionId: (s.subscription as { id?: string }).id,
        merchantName: s.subscription.merchantName,
        currentMonthlyCost: s.currentMonthlyCost,
        bestSavingPerMonth: s.bestSavingPerMonth,
        alternatives: s.alternatives,
      })),
      totalMonthlySavings: savings.totalMonthlySavings,
      totalAnnualSavings: savings.totalAnnualSavings,
    });
  } catch (err) {
    console.error("Savings error:", err);
    return NextResponse.json(
      { error: "Erreur lors du calcul des économies" },
      { status: 500 }
    );
  }
}
