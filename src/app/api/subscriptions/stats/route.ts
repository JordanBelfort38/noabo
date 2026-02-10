import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { calculateMonthlyCost } from "@/lib/savings-calculator";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const userId = session!.user.id;

  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
  });

  const active = subscriptions.filter(
    (s) => s.status === "ACTIVE" || s.status === "ENDING_SOON"
  );

  // Total monthly & annual cost
  const totalMonthlyCost = active.reduce(
    (sum, s) => sum + calculateMonthlyCost(s),
    0
  );
  const totalAnnualCost = totalMonthlyCost * 12;

  // Count by status
  const byStatus: Record<string, number> = {};
  for (const s of subscriptions) {
    byStatus[s.status] = (byStatus[s.status] ?? 0) + 1;
  }

  // Count by category
  const byCategory: Record<string, { count: number; monthlyCost: number }> = {};
  for (const s of active) {
    const cat = s.category ?? "other";
    if (!byCategory[cat]) byCategory[cat] = { count: 0, monthlyCost: 0 };
    byCategory[cat].count++;
    byCategory[cat].monthlyCost += calculateMonthlyCost(s);
  }

  // Top 5 most expensive
  const topExpensive = [...active]
    .sort((a, b) => calculateMonthlyCost(b) - calculateMonthlyCost(a))
    .slice(0, 5)
    .map((s) => ({
      id: s.id,
      merchantName: s.displayName ?? s.merchantName,
      monthlyCost: calculateMonthlyCost(s),
      frequency: s.frequency,
      category: s.category,
    }));

  // Upcoming charges (next 30 days)
  const now = new Date();
  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);

  const upcoming = active
    .filter((s) => s.nextChargeDate && s.nextChargeDate >= now && s.nextChargeDate <= in30Days)
    .sort((a, b) => (a.nextChargeDate?.getTime() ?? 0) - (b.nextChargeDate?.getTime() ?? 0))
    .map((s) => ({
      id: s.id,
      merchantName: s.displayName ?? s.merchantName,
      amount: s.amount,
      nextChargeDate: s.nextChargeDate,
    }));

  // Spending trend (last 6 months from transactions)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyTxs = await prisma.transaction.groupBy({
    by: ["date"],
    where: {
      userId,
      category: "subscription",
      amount: { lt: 0 },
      date: { gte: sixMonthsAgo },
    },
    _sum: { amount: true },
  });

  // Aggregate by month
  const spendingByMonth: Record<string, number> = {};
  for (const tx of monthlyTxs) {
    const key = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, "0")}`;
    spendingByMonth[key] = (spendingByMonth[key] ?? 0) + Math.abs(tx._sum.amount ?? 0);
  }

  // Fill in missing months
  const trend: { month: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    trend.push({
      month: monthNames[d.getMonth()],
      amount: spendingByMonth[key] ?? 0,
    });
  }

  return NextResponse.json({
    totalMonthlyCost,
    totalAnnualCost,
    activeCount: active.length,
    totalCount: subscriptions.length,
    byStatus,
    byCategory,
    topExpensive,
    upcoming,
    trend,
  });
}
