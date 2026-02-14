import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/admin/DataTable";
import { KPICard } from "@/components/admin/KPICard";
import { FileText, BookOpen, Scissors, Star } from "lucide-react";

async function getContentStats() {
  const [
    totalTemplates,
    totalRequests,
    requestsByMethod,
    templates,
  ] = await Promise.all([
    prisma.cancellationTemplate.count(),
    prisma.cancellationRequest.count(),
    prisma.cancellationRequest.groupBy({
      by: ["method"],
      _count: true,
      orderBy: { _count: { method: "desc" } },
    }),
    prisma.cancellationTemplate.findMany({
      select: {
        merchantName: true,
        displayName: true,
        category: true,
        difficulty: true,
      },
      orderBy: { merchantName: "asc" },
    }),
  ]);

  // Count cancellation requests per subscription's merchantName
  const requestCounts = await prisma.cancellationRequest.groupBy({
    by: ["subscriptionId"],
    _count: true,
  });

  // Get subscription merchantNames for those IDs
  const subIds = requestCounts.map((r) => r.subscriptionId);
  const subs = subIds.length > 0
    ? await prisma.subscription.findMany({
        where: { id: { in: subIds } },
        select: { id: true, merchantName: true },
      })
    : [];

  const subMap = new Map(subs.map((s) => [s.id, s.merchantName]));
  const merchantCounts = new Map<string, number>();
  for (const rc of requestCounts) {
    const merchant = subMap.get(rc.subscriptionId);
    if (merchant) {
      merchantCounts.set(merchant, (merchantCounts.get(merchant) ?? 0) + rc._count);
    }
  }

  const topTemplates = templates
    .map((t) => ({ ...t, requestCount: merchantCounts.get(t.merchantName) ?? 0 }))
    .sort((a, b) => b.requestCount - a.requestCount)
    .slice(0, 15);

  return { totalTemplates, totalRequests, requestsByMethod, topTemplates };
}

export default async function ContentPage() {
  const stats = await getContentStats();

  const methodLabels: Record<string, string> = {
    ONLINE: "En ligne",
    EMAIL: "E-mail",
    PHONE: "Téléphone",
    LETTER: "Courrier",
  };

  const difficultyBadge = (d: string) => {
    const map: Record<string, string> = {
      EASY: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      HARD: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    };
    return map[d] ?? "bg-zinc-100 text-zinc-600";
  };

  type TemplateRow = {
    service: string;
    category: string;
    difficulty: string;
    requests: number;
  };

  const tableData: TemplateRow[] = stats.topTemplates.map((t) => ({
    service: t.displayName,
    category: t.category,
    difficulty: t.difficulty,
    requests: t.requestCount,
  }));

  const columns: { key: keyof TemplateRow; label: string; sortable?: boolean; render?: (value: TemplateRow[keyof TemplateRow], row: TemplateRow) => React.ReactNode }[] = [
    { key: "service", label: "Service", sortable: true },
    { key: "category", label: "Catégorie" },
    {
      key: "difficulty",
      label: "Difficulté",
      render: (v) => (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${difficultyBadge(String(v))}`}>
          {String(v)}
        </span>
      ),
    },
    { key: "requests", label: "Résiliations", sortable: true },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Contenu</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Templates de résiliation et utilisation du contenu
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Templates"
          value={stats.totalTemplates}
          icon={<FileText className="h-5 w-5 text-blue-600" />}
          accentColor="blue"
        />
        <KPICard
          title="Résiliations totales"
          value={stats.totalRequests}
          icon={<Scissors className="h-5 w-5 text-rose-600" />}
          accentColor="rose"
        />
        <KPICard
          title="Méthode favorite"
          value={
            stats.requestsByMethod.length > 0
              ? methodLabels[stats.requestsByMethod[0].method] ?? stats.requestsByMethod[0].method
              : "—"
          }
          icon={<Star className="h-5 w-5 text-amber-600" />}
          accentColor="amber"
        />
        <KPICard
          title="Guides consultés"
          value={stats.topTemplates.filter((t) => t.requestCount > 0).length}
          icon={<BookOpen className="h-5 w-5 text-emerald-600" />}
          accentColor="emerald"
        />
      </div>

      {/* Methods breakdown */}
      {stats.requestsByMethod.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Résiliations par méthode
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.requestsByMethod.map((m) => (
              <div key={m.method} className="rounded-lg bg-zinc-50 p-4 text-center dark:bg-zinc-800">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{m._count}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {methodLabels[m.method] ?? m.method}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <DataTable columns={columns} data={tableData} title="Templates les plus utilisés" exportable />
    </div>
  );
}
