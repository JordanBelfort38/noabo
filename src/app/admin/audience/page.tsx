import { prisma } from "@/lib/prisma";
import { KPICard } from "@/components/admin/KPICard";
import { DataTable } from "@/components/admin/DataTable";
import { Users, UserCheck, Shield, Clock } from "lucide-react";

async function getAudienceStats() {
  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * 86400000);
  const d30 = new Date(now.getTime() - 30 * 86400000);

  const [
    totalUsers,
    usersLast7d,
    usersLast30d,
    adminCount,
    verifiedCount,
    usersWithBank,
    usersWithSubs,
    allUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: d7 } } }),
    prisma.user.count({ where: { createdAt: { gte: d30 } } }),
    prisma.user.count({ where: { role: "admin" } }),
    prisma.user.count({ where: { emailVerified: { not: null } } }),
    prisma.user.count({ where: { bankConnections: { some: {} } } }),
    prisma.user.count({ where: { subscriptions: { some: {} } } }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        emailVerified: true,
        _count: { select: { subscriptions: true, bankConnections: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return {
    totalUsers,
    usersLast7d,
    usersLast30d,
    adminCount,
    verifiedCount,
    usersWithBank,
    usersWithSubs,
    allUsers,
  };
}

export default async function AudiencePage() {
  const stats = await getAudienceStats();

  type UserRow = {
    name: string;
    email: string;
    role: string;
    subscriptions: number;
    banks: number;
    verified: string;
    joined: string;
  };

  const tableData: UserRow[] = stats.allUsers.map((u) => ({
    name: u.name ?? "—",
    email: u.email,
    role: u.role ?? "user",
    subscriptions: u._count.subscriptions,
    banks: u._count.bankConnections,
    verified: u.emailVerified ? "Oui" : "Non",
    joined: u.createdAt.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  }));

  const columns: {
    key: keyof UserRow;
    label: string;
    sortable?: boolean;
    render?: (value: UserRow[keyof UserRow], row: UserRow) => React.ReactNode;
  }[] = [
    { key: "name", label: "Nom", sortable: true },
    {
      key: "email",
      label: "Email",
      render: (v) => (
        <span className="font-mono text-xs">{String(v)}</span>
      ),
    },
    {
      key: "role",
      label: "Rôle",
      render: (v) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
            v === "admin"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {String(v)}
        </span>
      ),
    },
    { key: "subscriptions", label: "Abonnements", sortable: true },
    { key: "banks", label: "Banques", sortable: true },
    {
      key: "verified",
      label: "Vérifié",
      render: (v) => (
        <span className={v === "Oui" ? "text-emerald-600" : "text-zinc-400"}>
          {String(v)}
        </span>
      ),
    },
    { key: "joined", label: "Inscrit le", sortable: true },
  ];

  const retentionRate =
    stats.totalUsers > 0
      ? Math.round((stats.usersWithSubs / stats.totalUsers) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Audience
        </h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Analyse détaillée des utilisateurs de la plateforme
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Utilisateurs totaux"
          value={stats.totalUsers.toLocaleString("fr-FR")}
          icon={<Users className="h-5 w-5 text-blue-600" />}
          accentColor="blue"
        />
        <KPICard
          title="Nouveaux (7j)"
          value={stats.usersLast7d.toLocaleString("fr-FR")}
          icon={<Clock className="h-5 w-5 text-emerald-600" />}
          accentColor="emerald"
        />
        <KPICard
          title="Avec abonnements"
          value={`${retentionRate}%`}
          icon={<UserCheck className="h-5 w-5 text-violet-600" />}
          accentColor="violet"
        />
        <KPICard
          title="Admins"
          value={stats.adminCount}
          icon={<Shield className="h-5 w-5 text-orange-600" />}
          accentColor="orange"
        />
      </div>

      {/* Engagement breakdown */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Email vérifié</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {stats.verifiedCount}
            <span className="ml-2 text-sm font-normal text-zinc-400">
              / {stats.totalUsers}
            </span>
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Banque connectée</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {stats.usersWithBank}
            <span className="ml-2 text-sm font-normal text-zinc-400">
              / {stats.totalUsers}
            </span>
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Avec abonnements</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {stats.usersWithSubs}
            <span className="ml-2 text-sm font-normal text-zinc-400">
              / {stats.totalUsers}
            </span>
          </p>
        </div>
      </div>

      <DataTable columns={columns} data={tableData} title="Tous les utilisateurs" exportable />
    </div>
  );
}
