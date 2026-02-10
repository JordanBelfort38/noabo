import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { rateLimit } from "@/lib/rate-limit";
import { initiateBankConnection } from "@/lib/bank-api";

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = rateLimit(`bank-connect:${ip}`, { limit: 10, windowSeconds: 3600 });
  if (!success) {
    return NextResponse.json(
      { error: "Trop de tentatives. Veuillez réessayer plus tard." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const provider = (body as { provider?: string }).provider ?? "bridge";

    const { redirectUrl, state } = await initiateBankConnection(
      session!.user.id,
      provider
    );

    return NextResponse.json({ redirectUrl, state });
  } catch (err) {
    console.error("Bank connect error:", err);
    return NextResponse.json(
      { error: "Erreur lors de l'initialisation de la connexion bancaire" },
      { status: 500 }
    );
  }
}
