import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (difficulty) where.difficulty = difficulty;
  if (search) {
    where.OR = [
      { merchantName: { contains: search, mode: "insensitive" } },
      { displayName: { contains: search, mode: "insensitive" } },
    ];
  }

  const templates = await prisma.cancellationTemplate.findMany({
    where,
    orderBy: { merchantName: "asc" },
    select: {
      id: true,
      merchantName: true,
      displayName: true,
      category: true,
      difficulty: true,
      onlineUrl: true,
      requiresCall: true,
      requiresLetter: true,
      noticeRequired: true,
      lawReference: true,
      contractType: true,
    },
  });

  return NextResponse.json({ templates });
}
