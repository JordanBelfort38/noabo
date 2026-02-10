import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { disconnectBank } from "@/lib/bank-api";

export async function DELETE(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json().catch(() => ({}));
    const connectionId = (body as { connectionId?: string }).connectionId;

    if (!connectionId) {
      return NextResponse.json(
        { error: "connectionId requis" },
        { status: 400 }
      );
    }

    await disconnectBank(connectionId, session!.user.id);

    return NextResponse.json({
      message: "Connexion bancaire supprimée avec succès",
    });
  } catch (err) {
    console.error("Disconnect error:", err);
    const message =
      err instanceof Error && err.message === "Connection not found"
        ? "Connexion non trouvée"
        : "Erreur lors de la déconnexion";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
