import { prisma } from "@/lib/prisma";
import { KPICard } from "@/components/admin/KPICard";
import { ConversionFunnel } from "@/components/admin/charts/ConversionFunnel";
import { CheckCircle, UserPlus, CreditCard, Landmark } from "lucide-react";

async function getConversionStats() {
  const [
    totalUsers,
    usersWithBank,
    usersWithSubs,
    usersWithCancellations,
    confirmedSubs,
    totalSubs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { bankConnections: { some: {} } } }),
    prisma.user.count({ where: { subscriptions: { some: {} } } }),
    prisma.user.count({ where: { cancellationRequests: { some: {} } } }),
    prisma.subscription.count({ where: { confidence: { gte: 100 } } }),
    prisma.subscription.count(),
  ]);

  return {
    totalUsers,
    usersWithBank,
    usersWithSubs,
    usersWithCancellations,
    confirmedSubs,
    totalSubs,
  };
}

export default async function ConversionsPage() {
  const stats = await getConversionStats();

  const bankRate =
    stats.totalUsers > 0
      ? ((stats.usersWithBank / stats.totalUsers) * 100).toFixed(1)
      : "0";
  const subsRate =
    stats.totalUsers > 0
      ? ((stats.usersWithSubs / stats.totalUsers) * 100).toFixed(1)
      : "0";
  const cancelRate =
    stats.usersWithSubs > 0
      ? ((stats.usersWithCancellations / stats.usersWithSubs) * 100).toFixed(1)
      : "0";
  const confirmRate =
    stats.totalSubs > 0
      ? ((stats.confirmedSubs / stats.totalSubs) * 100).toFixed(1)
      : "0";

  const funnelData = [
    { name: "Inscription", value: stats.totalUsers, color: "#3B82F6" },
    { name: "Banque connectée", value: stats.usersWithBank, color: "#10B981" },
    { name: "Abonnements détectés", value: stats.usersWithSubs, color: "#F59E0B" },
    { name: "Résiliation lancée", value: stats.usersWithCancellations, color: "#EF4444" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Conversions
        </h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Entonnoir de conversion et taux d&apos;activation des utilisateurs
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Inscrits → Banque"
          value={`${bankRate}%`}
          icon={<Landmark className="h-5 w-5 text-blue-600" />}
          accentColor="blue"
        />
        <KPICard
          title="Inscrits → Abonnements"
          value={`${subsRate}%`}
          icon={<CreditCard className="h-5 w-5 text-emerald-600" />}
          accentColor="emerald"
        />
        <KPICard
          title="Abonnés → Résiliation"
          value={`${cancelRate}%`}
          icon={<CheckCircle className="h-5 w-5 text-amber-600" />}
          accentColor="amber"
        />
        <KPICard
          title="Abos confirmés"
          value={`${confirmRate}%`}
          icon={<UserPlus className="h-5 w-5 text-violet-600" />}
          accentColor="violet"
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Entonnoir de conversion
        </h2>
        <ConversionFunnel data={funnelData} />
      </div>

      {/* Step-by-step conversion details */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {funnelData.map((step, i) => {
          const prev = i > 0 ? funnelData[i - 1].value : step.value;
          const dropoff = prev > 0 ? (((prev - step.value) / prev) * 100).toFixed(1) : "0";
          return (
            <div
              key={step.name}
              className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div
                className="mb-3 h-1.5 rounded-full"
                style={{ backgroundColor: step.color }}
              />
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {step.name}
              </p>
              <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {step.value.toLocaleString("fr-FR")}
              </p>
              {i > 0 && (
                <p className="mt-1 text-xs text-rose-500">
                  −{dropoff}% de perte
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
