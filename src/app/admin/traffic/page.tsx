"use client";

import { useState } from "react";
import { KPICard } from "@/components/admin/KPICard";
import { TimeRangeSelector } from "@/components/admin/TimeRangeSelector";
import { TrafficChart } from "@/components/admin/charts/TrafficChart";
import { DataTable } from "@/components/admin/DataTable";
import { Eye, Clock, MousePointerClick, ArrowDownUp } from "lucide-react";

function generateTrafficData(days: number) {
  const data: { date: string; visitors: number; sessions: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const base = 30 + Math.floor(Math.random() * 50);
    data.push({
      date: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      visitors: base,
      sessions: base + Math.floor(Math.random() * 20),
    });
  }
  return data;
}

const RANGE_DAYS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "12m": 365,
};

const topPages = [
  { page: "/", views: 1245, uniqueViews: 980, avgTime: "2m 34s", bounceRate: "38%" },
  { page: "/help/cancel", views: 876, uniqueViews: 720, avgTime: "4m 12s", bounceRate: "22%" },
  { page: "/login", views: 654, uniqueViews: 590, avgTime: "1m 05s", bounceRate: "45%" },
  { page: "/register", views: 432, uniqueViews: 398, avgTime: "2m 48s", bounceRate: "35%" },
  { page: "/dashboard", views: 389, uniqueViews: 310, avgTime: "5m 22s", bounceRate: "12%" },
  { page: "/help/cancel/netflix", views: 287, uniqueViews: 265, avgTime: "3m 45s", bounceRate: "28%" },
  { page: "/help/cancel/free", views: 198, uniqueViews: 178, avgTime: "3m 18s", bounceRate: "30%" },
  { page: "/dashboard/bank", views: 156, uniqueViews: 134, avgTime: "4m 02s", bounceRate: "15%" },
];

type PageRow = (typeof topPages)[number];

const columns: { key: keyof PageRow; label: string; sortable?: boolean; render?: (value: PageRow[keyof PageRow], row: PageRow) => React.ReactNode }[] = [
  {
    key: "page",
    label: "Page",
    render: (v) => <span className="font-mono text-xs">{String(v)}</span>,
  },
  { key: "views", label: "Vues", sortable: true },
  { key: "uniqueViews", label: "Vues uniques", sortable: true },
  { key: "avgTime", label: "Temps moyen" },
  {
    key: "bounceRate",
    label: "Taux de rebond",
    sortable: true,
    render: (v) => {
      const n = parseInt(String(v));
      return (
        <span className={n > 40 ? "text-rose-600" : n > 25 ? "text-amber-600" : "text-emerald-600"}>
          {String(v)}
        </span>
      );
    },
  },
];

export default function TrafficPage() {
  const [range, setRange] = useState("7d");
  const trafficData = generateTrafficData(RANGE_DAYS[range] ?? 7);

  const totalVisitors = trafficData.reduce((s, d) => s + d.visitors, 0);
  const totalSessions = trafficData.reduce((s, d) => s + d.sessions, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Trafic</h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Métriques détaillées du trafic sur la plateforme
          </p>
        </div>
        <TimeRangeSelector value={range} onChange={setRange} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Visiteurs uniques"
          value={totalVisitors.toLocaleString("fr-FR")}
          change={12.5}
          icon={<Eye className="h-5 w-5 text-blue-600" />}
          accentColor="blue"
        />
        <KPICard
          title="Sessions"
          value={totalSessions.toLocaleString("fr-FR")}
          change={8.3}
          icon={<MousePointerClick className="h-5 w-5 text-emerald-600" />}
          accentColor="emerald"
        />
        <KPICard
          title="Durée moy. session"
          value="3m 12s"
          change={4.1}
          icon={<Clock className="h-5 w-5 text-violet-600" />}
          accentColor="violet"
        />
        <KPICard
          title="Taux de rebond"
          value="38%"
          change={-2.4}
          icon={<ArrowDownUp className="h-5 w-5 text-orange-600" />}
          accentColor="orange"
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Évolution du trafic
        </h2>
        <TrafficChart data={trafficData} />
      </div>

      <DataTable columns={columns} data={topPages} title="Pages les plus visitées" exportable />
    </div>
  );
}
