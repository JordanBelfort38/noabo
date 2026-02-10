import { prisma } from "@/lib/prisma";
import { calculateMonthlyCost } from "@/lib/savings-calculator";

export interface RenewalAlert {
  type: "renewal" | "commitment_ending" | "price_increase" | "inactive";
  severity: "info" | "warning" | "urgent" | "tip";
  subscriptionId: string;
  merchantName: string;
  message: string;
  date: Date | null;
  amount?: number;
}

export async function getUpcomingRenewals(
  userId: string,
  days: number = 30
): Promise<RenewalAlert[]> {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      status: { in: ["ACTIVE", "ENDING_SOON"] },
      nextChargeDate: { gte: now, lte: future },
    },
    orderBy: { nextChargeDate: "asc" },
  });

  return subscriptions.map((sub) => {
    const daysUntil = sub.nextChargeDate
      ? Math.ceil(
          (sub.nextChargeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

    return {
      type: "renewal" as const,
      severity: daysUntil <= 3 ? "urgent" as const : daysUntil <= 7 ? "warning" as const : "info" as const,
      subscriptionId: sub.id,
      merchantName: sub.displayName ?? sub.merchantName,
      message: `${sub.displayName ?? sub.merchantName} se renouvelle dans ${daysUntil} jour${daysUntil > 1 ? "s" : ""} (${formatAmount(sub.amount)})`,
      date: sub.nextChargeDate,
      amount: sub.amount,
    };
  });
}

export async function getEndingCommitments(
  userId: string,
  days: number = 60
): Promise<RenewalAlert[]> {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      status: { in: ["ACTIVE", "ENDING_SOON"] },
      commitmentEndDate: { gte: now, lte: future },
    },
    orderBy: { commitmentEndDate: "asc" },
  });

  return subscriptions.map((sub) => {
    const daysUntil = sub.commitmentEndDate
      ? Math.ceil(
          (sub.commitmentEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

    return {
      type: "commitment_ending" as const,
      severity: daysUntil <= 14 ? "warning" as const : "info" as const,
      subscriptionId: sub.id,
      merchantName: sub.displayName ?? sub.merchantName,
      message: `Votre engagement ${sub.displayName ?? sub.merchantName} se termine dans ${daysUntil} jour${daysUntil > 1 ? "s" : ""}. Pensez à résilier si vous ne souhaitez pas renouveler.`,
      date: sub.commitmentEndDate,
      amount: sub.amount,
    };
  });
}

export async function checkPriceChanges(
  userId: string
): Promise<RenewalAlert[]> {
  const alerts: RenewalAlert[] = [];

  const subscriptions = await prisma.subscription.findMany({
    where: { userId, status: "ACTIVE" },
  });

  for (const sub of subscriptions) {
    if (sub.transactionIds.length < 3) continue;

    // Fetch the last few transactions for this merchant
    const recentTxs = await prisma.transaction.findMany({
      where: {
        userId,
        merchantName: sub.merchantName,
        amount: { lt: 0 },
      },
      orderBy: { date: "desc" },
      take: 5,
      select: { amount: true, date: true },
    });

    if (recentTxs.length < 2) continue;

    const latestAmount = Math.abs(recentTxs[0].amount);
    const previousAmounts = recentTxs.slice(1).map((t) => Math.abs(t.amount));
    const avgPrevious =
      previousAmounts.reduce((a, b) => a + b, 0) / previousAmounts.length;

    // Detect >5% increase
    if (latestAmount > avgPrevious * 1.05) {
      const increase = latestAmount - Math.round(avgPrevious);
      alerts.push({
        type: "price_increase",
        severity: "warning",
        subscriptionId: sub.id,
        merchantName: sub.displayName ?? sub.merchantName,
        message: `${sub.displayName ?? sub.merchantName} a augmenté de ${formatAmount(increase)} ce mois-ci`,
        date: recentTxs[0].date,
        amount: increase,
      });
    }
  }

  return alerts;
}

export async function getInactiveSubscriptions(
  userId: string
): Promise<RenewalAlert[]> {
  const now = new Date();

  const subscriptions = await prisma.subscription.findMany({
    where: { userId, status: "ACTIVE" },
  });

  const alerts: RenewalAlert[] = [];

  for (const sub of subscriptions) {
    if (!sub.lastChargeDate) continue;

    // Calculate expected interval based on frequency
    const intervalDays: Record<string, number> = {
      WEEKLY: 7,
      BIWEEKLY: 14,
      MONTHLY: 30,
      BIMONTHLY: 60,
      QUARTERLY: 90,
      SEMIANNUAL: 180,
      ANNUAL: 365,
    };

    const expected = intervalDays[sub.frequency] ?? 30;
    const daysSinceLastCharge = Math.ceil(
      (now.getTime() - sub.lastChargeDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // If no charge in 1.5x the expected interval, flag as inactive
    if (daysSinceLastCharge > expected * 1.5) {
      alerts.push({
        type: "inactive",
        severity: "tip",
        subscriptionId: sub.id,
        merchantName: sub.displayName ?? sub.merchantName,
        message: `Aucun prélèvement de ${sub.displayName ?? sub.merchantName} depuis ${daysSinceLastCharge} jours. Cet abonnement est peut-être déjà résilié.`,
        date: sub.lastChargeDate,
        amount: calculateMonthlyCost(sub),
      });
    }
  }

  return alerts;
}

export async function getAllAlerts(userId: string): Promise<RenewalAlert[]> {
  const [renewals, commitments, priceChanges, inactive] = await Promise.all([
    getUpcomingRenewals(userId, 30),
    getEndingCommitments(userId, 60),
    checkPriceChanges(userId),
    getInactiveSubscriptions(userId),
  ]);

  const all = [...renewals, ...commitments, ...priceChanges, ...inactive];

  // Sort: urgent first, then warning, then info, then tip
  const severityOrder = { urgent: 0, warning: 1, info: 2, tip: 3 };
  all.sort(
    (a, b) =>
      (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4)
  );

  return all;
}

function formatAmount(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
