import { prisma } from "@/lib/prisma";
import { Users, CreditCard, Scissors, Landmark, TrendingUp, Activity } from "lucide-react";
import { KPICard } from "@/components/admin/KPICard";
import { AdminOverviewCharts } from "./AdminOverviewCharts";

async function getAdminStats() {
  const [
    totalUsers,
    usersLast30d,
    totalSubscriptions,
    activeSubscriptions,
    totalCancellations,
    totalBankConnections,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) } },
    }),
    prisma.subscription.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.cancellationRequest.count(),
    prisma.bankConnection.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, name: true, email: true, createdAt: true, role: true },
    }),
  ]);

  // Monthly revenue from active subscriptions (sum of amounts in cents)
  const subsAgg = await prisma.subscription.aggregate({
    where: { status: "ACTIVE" },
    _sum: { amount: true },
    _avg: { amount: true },
  });

  return {
    totalUsers,
    usersLast30d,
    totalSubscriptions,
    activeSubscriptions,
    totalCancellations,
    totalBankConnections,
    totalMonthlyTracked: subsAgg._sum.amount ?? 0,
    avgSubscriptionCost: subsAgg._avg.amount ?? 0,
    recentUsers,
  };
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const formatEur = (cents: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Vue d&apos;ensemble
        </h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Statistiques globales de la plateforme No Abo
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard
          title="Utilisateurs"
          value={stats.totalUsers.toLocaleString("fr-FR")}
          icon={<Users className="h-5 w-5 text-blue-600" />}
          accentColor="blue"
        />
        <KPICard
          title="Nouveaux (30j)"
          value={stats.usersLast30d.toLocaleString("fr-FR")}
          icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
          accentColor="emerald"
        />
        <KPICard
          title="Abonnements actifs"
          value={stats.activeSubscriptions.toLocaleString("fr-FR")}
          icon={<CreditCard className="h-5 w-5 text-violet-600" />}
          accentColor="violet"
        />
        <KPICard
          title="Résiliations"
          value={stats.totalCancellations.toLocaleString("fr-FR")}
          icon={<Scissors className="h-5 w-5 text-rose-600" />}
          accentColor="rose"
        />
        <KPICard
          title="Banques connectées"
          value={stats.totalBankConnections.toLocaleString("fr-FR")}
          icon={<Landmark className="h-5 w-5 text-orange-600" />}
          accentColor="orange"
        />
        <KPICard
          title="Coût moyen / abo"
          value={formatEur(stats.avgSubscriptionCost)}
          icon={<Activity className="h-5 w-5 text-amber-600" />}
          accentColor="amber"
        />
      </div>

      {/* Charts */}
      <AdminOverviewCharts />

      {/* Recent users table */}
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Derniers inscrits
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Nom
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Email
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Rôle
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Inscrit le
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {stats.recentUsers.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {u.name ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {u.email}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        u.role === "admin"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {u.createdAt.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
