import { prisma } from "@/lib/prisma";
import { KPICard } from "@/components/admin/KPICard";
import { DataTable } from "@/components/admin/DataTable";
import { Server, Database, HardDrive, Zap } from "lucide-react";

async function getTechnicalStats() {
  const [
    userCount,
    subscriptionCount,
    transactionCount,
    bankConnectionCount,
    cancellationRequestCount,
    cancellationTemplateCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count(),
    prisma.transaction.count(),
    prisma.bankConnection.count(),
    prisma.cancellationRequest.count(),
    prisma.cancellationTemplate.count(),
  ]);

  return {
    userCount,
    subscriptionCount,
    transactionCount,
    bankConnectionCount,
    cancellationRequestCount,
    cancellationTemplateCount,
  };
}

export default async function TechnicalPage() {
  const stats = await getTechnicalStats();

  const totalRecords =
    stats.userCount +
    stats.subscriptionCount +
    stats.transactionCount +
    stats.bankConnectionCount +
    stats.cancellationRequestCount +
    stats.cancellationTemplateCount;

  type TableRow = { table: string; records: number; description: string };

  const tableData: TableRow[] = [
    { table: "User", records: stats.userCount, description: "Comptes utilisateurs" },
    { table: "Subscription", records: stats.subscriptionCount, description: "Abonnements détectés" },
    { table: "Transaction", records: stats.transactionCount, description: "Transactions bancaires" },
    { table: "BankConnection", records: stats.bankConnectionCount, description: "Connexions bancaires" },
    { table: "CancellationRequest", records: stats.cancellationRequestCount, description: "Demandes de résiliation" },
    { table: "CancellationTemplate", records: stats.cancellationTemplateCount, description: "Templates de résiliation" },
  ];

  const columns: {
    key: keyof TableRow;
    label: string;
    sortable?: boolean;
    render?: (value: TableRow[keyof TableRow]) => React.ReactNode;
  }[] = [
    {
      key: "table",
      label: "Table",
      sortable: true,
      render: (v) => <span className="font-mono text-xs font-semibold">{String(v)}</span>,
    },
    { key: "records", label: "Enregistrements", sortable: true },
    { key: "description", label: "Description" },
  ];

  const envVars = [
    { name: "DATABASE_URL", status: !!process.env.DATABASE_URL },
    { name: "AUTH_SECRET", status: !!process.env.AUTH_SECRET },
    { name: "BRIDGE_CLIENT_ID", status: !!process.env.BRIDGE_CLIENT_ID },
    { name: "BRIDGE_CLIENT_SECRET", status: !!process.env.BRIDGE_CLIENT_SECRET },
    { name: "NEXT_PUBLIC_APP_URL", status: !!process.env.NEXT_PUBLIC_APP_URL },
    { name: "ENCRYPTION_KEY", status: !!process.env.ENCRYPTION_KEY },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Technique
        </h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          État du système, base de données et configuration
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Enregistrements totaux"
          value={totalRecords.toLocaleString("fr-FR")}
          icon={<Database className="h-5 w-5 text-blue-600" />}
          accentColor="blue"
        />
        <KPICard
          title="Tables"
          value={6}
          icon={<HardDrive className="h-5 w-5 text-emerald-600" />}
          accentColor="emerald"
        />
        <KPICard
          title="Framework"
          value="Next.js 16"
          icon={<Zap className="h-5 w-5 text-violet-600" />}
          accentColor="violet"
        />
        <KPICard
          title="ORM"
          value="Prisma 7"
          icon={<Server className="h-5 w-5 text-orange-600" />}
          accentColor="orange"
        />
      </div>

      {/* Environment variables status */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Variables d&apos;environnement
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {envVars.map((v) => (
            <div
              key={v.name}
              className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-800"
            >
              <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                {v.name}
              </span>
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                  v.status
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                }`}
              >
                {v.status ? "✓" : "✗"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stack info */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Stack technique
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Next.js", version: "16.1.6" },
            { name: "React", version: "19.2.3" },
            { name: "Prisma", version: "7.3.0" },
            { name: "NextAuth", version: "5 beta 30" },
            { name: "TypeScript", version: "5.x" },
            { name: "Tailwind CSS", version: "4.x" },
            { name: "Zod", version: "4.x" },
            { name: "Recharts", version: "3.x" },
          ].map((dep) => (
            <div
              key={dep.name}
              className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-800"
            >
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {dep.name}
              </span>
              <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                {dep.version}
              </span>
            </div>
          ))}
        </div>
      </div>

      <DataTable columns={columns} data={tableData} title="Tables de la base de données" />
    </div>
  );
}
