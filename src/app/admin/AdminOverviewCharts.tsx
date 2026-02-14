"use client";

import { useState } from "react";
import { TimeRangeSelector } from "@/components/admin/TimeRangeSelector";
import { TrafficChart } from "@/components/admin/charts/TrafficChart";
import { SourcesPieChart } from "@/components/admin/charts/SourcesPieChart";

// Demo data — replace with real analytics (Umami, Plausible, etc.)
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

const sourcesData = [
  { name: "Direct", value: 42, color: "#3B82F6" },
  { name: "Google", value: 28, color: "#10B981" },
  { name: "Réseaux sociaux", value: 18, color: "#F59E0B" },
  { name: "Referral", value: 12, color: "#8B5CF6" },
];

const RANGE_DAYS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "12m": 365,
};

export function AdminOverviewCharts() {
  const [range, setRange] = useState("7d");
  const trafficData = generateTrafficData(RANGE_DAYS[range] ?? 7);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Trafic & Sources
        </h2>
        <TimeRangeSelector value={range} onChange={setRange} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
          <h3 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Visiteurs & Sessions
          </h3>
          <TrafficChart data={trafficData} />
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Sources de trafic
          </h3>
          <SourcesPieChart data={sourcesData} />
        </div>
      </div>
    </div>
  );
}
