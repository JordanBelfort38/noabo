import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const source = searchParams.get("source") ?? "";
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const recurring = searchParams.get("recurring");

  const where: Record<string, unknown> = { userId: session!.user.id };

  if (search) {
    where.OR = [
      { description: { contains: search, mode: "insensitive" } },
      { merchantName: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category) where.category = category;
  if (source) where.importSource = source;
  if (recurring === "true") where.isRecurring = true;
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) (where.date as Record<string, unknown>).gte = new Date(dateFrom);
    if (dateTo) (where.date as Record<string, unknown>).lte = new Date(dateTo);
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        bankAccount: { select: { name: true } },
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  // Summary stats
  const stats = await prisma.transaction.aggregate({
    where: { userId: session!.user.id },
    _sum: { amount: true },
    _count: true,
  });

  const debitSum = await prisma.transaction.aggregate({
    where: { userId: session!.user.id, amount: { lt: 0 } },
    _sum: { amount: true },
  });

  const creditSum = await prisma.transaction.aggregate({
    where: { userId: session!.user.id, amount: { gt: 0 } },
    _sum: { amount: true },
  });

  return NextResponse.json({
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    stats: {
      totalTransactions: stats._count,
      netBalance: stats._sum.amount ?? 0,
      totalDebit: debitSum._sum.amount ?? 0,
      totalCredit: creditSum._sum.amount ?? 0,
    },
  });
}
