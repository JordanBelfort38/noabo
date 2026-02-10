import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ merchantName: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { merchantName } = await params;
  const decoded = decodeURIComponent(merchantName);

  const template = await prisma.cancellationTemplate.findUnique({
    where: { merchantName: decoded },
  });

  if (!template) {
    return NextResponse.json(
      { error: "Aucun guide de résiliation trouvé pour ce service" },
      { status: 404 }
    );
  }

  return NextResponse.json({ template });
}
