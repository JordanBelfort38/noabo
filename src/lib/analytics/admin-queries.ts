import { prisma } from "@/lib/prisma";

export async function getAdminOverviewStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    usersLast30,
    usersPrev30,
    totalSubscriptions,
    activeSubscriptions,
    totalCancellations,
    cancellationsLast30,
    bankConnections,
    totalTransactions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({
      where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    }),
    prisma.subscription.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.cancellationRequest.count(),
    prisma.cancellationRequest.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.bankConnection.count({ where: { status: "active" } }),
    prisma.transaction.count(),
  ]);

  const userGrowth =
    usersPrev30 > 0
      ? ((usersLast30 - usersPrev30) / usersPrev30) * 100
      : usersLast30 > 0
        ? 100
        : 0;

  return {
    totalUsers,
    newUsersLast30: usersLast30,
    userGrowth,
    totalSubscriptions,
    activeSubscriptions,
    totalCancellations,
    cancellationsLast30,
    bankConnections,
    totalTransactions,
  };
}

export async function getUserGrowthData(days: number = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const grouped: Record<string, number> = {};
  for (const u of users) {
    const day = u.createdAt.toISOString().split("T")[0];
    grouped[day] = (grouped[day] ?? 0) + 1;
  }

  const result: { date: string; visitors: number; sessions: number }[] = [];
  const current = new Date(since);
  let cumulative = 0;
  while (current <= new Date()) {
    const key = current.toISOString().split("T")[0];
    const count = grouped[key] ?? 0;
    cumulative += count;
    result.push({
      date: new Date(current).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      }),
      visitors: count,
      sessions: cumulative,
    });
    current.setDate(current.getDate() + 1);
  }

  return result;
}

export async function getTopSubscriptions(limit: number = 10) {
  const subscriptions = await prisma.subscription.groupBy({
    by: ["merchantName"],
    _count: { id: true },
    _avg: { amount: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });

  return subscriptions.map((s) => ({
    merchantName: s.merchantName,
    count: s._count.id,
    avgAmount: Math.round(s._avg.amount ?? 0),
  }));
}

export async function getCancellationStats() {
  const byStatus = await prisma.cancellationRequest.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const byMethod = await prisma.cancellationRequest.groupBy({
    by: ["method"],
    _count: { id: true },
  });

  return { byStatus, byMethod };
}

export async function getRecentUsers(limit: number = 20) {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      role: true,
      _count: {
        select: {
          subscriptions: true,
          bankConnections: true,
          cancellationRequests: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getContentPerformance() {
  const templates = await prisma.cancellationTemplate.findMany({
    select: {
      merchantName: true,
      displayName: true,
      category: true,
      difficulty: true,
    },
  });

  const cancellationsByMerchant = await prisma.cancellationRequest.groupBy({
    by: ["subscriptionId"],
    _count: { id: true },
  });

  const subscriptionIds = cancellationsByMerchant.map((c) => c.subscriptionId);
  const subscriptions = await prisma.subscription.findMany({
    where: { id: { in: subscriptionIds } },
    select: { id: true, merchantName: true },
  });

  const merchantCounts: Record<string, number> = {};
  for (const c of cancellationsByMerchant) {
    const sub = subscriptions.find((s) => s.id === c.subscriptionId);
    if (sub) {
      merchantCounts[sub.merchantName] =
        (merchantCounts[sub.merchantName] ?? 0) + c._count.id;
    }
  }

  return templates.map((t) => ({
    ...t,
    cancellationsCount: merchantCounts[t.merchantName] ?? 0,
  }));
}
