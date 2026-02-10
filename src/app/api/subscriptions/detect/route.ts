import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit } from "@/lib/rate-limit";
import {
  analyzeTransactionsForSubscriptions,
  persistDetectedSubscriptions,
} from "@/lib/subscription-detector";

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = rateLimit(`detect:${session!.user.id}`, {
    limit: 10,
    windowSeconds: 3600,
  });
  if (!success) {
    return NextResponse.json(
      { error: "Trop de tentatives. Veuillez réessayer plus tard." },
      { status: 429 }
    );
  }

  try {
    const detected = await analyzeTransactionsForSubscriptions(session!.user.id);
    const result = await persistDetectedSubscriptions(session!.user.id, detected);

    return NextResponse.json({
      message: `${result.created} abonnement(s) détecté(s), ${result.updated} mis à jour`,
      detected: detected.length,
      created: result.created,
      updated: result.updated,
      unchanged: result.unchanged,
      subscriptions: detected.map((d) => ({
        merchantName: d.merchantName,
        amount: d.averageAmount,
        frequency: d.frequency,
        confidence: d.confidence,
        nextChargeDate: d.nextChargeDate,
        occurrences: d.occurrences,
        category: d.category,
      })),
    });
  } catch (err) {
    console.error("Detection error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la détection des abonnements" },
      { status: 500 }
    );
  }
}
