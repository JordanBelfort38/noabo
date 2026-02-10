import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { syncTransactions } from "@/lib/bank-api";

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = rateLimit(`bank-sync:${session!.user.id}`, {
    limit: 10,
    windowSeconds: 3600,
  });
  if (!success) {
    return NextResponse.json(
      { error: "Trop de synchronisations. Veuillez réessayer plus tard." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const connectionId = (body as { connectionId?: string }).connectionId;

    if (!connectionId) {
      return NextResponse.json(
        { error: "connectionId requis" },
        { status: 400 }
      );
    }

    // Verify ownership
    const connection = await prisma.bankConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection || connection.userId !== session!.user.id) {
      return NextResponse.json(
        { error: "Connexion non trouvée" },
        { status: 404 }
      );
    }

    if (connection.status === "revoked") {
      return NextResponse.json(
        { error: "Cette connexion a été révoquée" },
        { status: 400 }
      );
    }

    const result = await syncTransactions(connectionId);

    return NextResponse.json({
      message: `${result.newCount} nouvelle(s) transaction(s) synchronisée(s)`,
      newCount: result.newCount,
      totalCount: result.totalCount,
    });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json(
      { error: "Erreur lors de la synchronisation" },
      { status: 500 }
    );
  }
}
