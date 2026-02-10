import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { getAllAlerts } from "@/lib/renewal-tracker";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const alerts = await getAllAlerts(session!.user.id);
    return NextResponse.json({ alerts });
  } catch (err) {
    console.error("Alerts error:", err);
    return NextResponse.json(
      { error: "Erreur lors du chargement des alertes" },
      { status: 500 }
    );
  }
}
