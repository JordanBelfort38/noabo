"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { BarChart3, PieChart as PieChartIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const SpendingChart = dynamic(
  () => import("@/components/charts/SpendingChart").then((m) => m.SpendingChart),
  {
    loading: () => (
      <div className="flex h-[280px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    ),
    ssr: false,
  }
);

const CategoryChart = dynamic(
  () => import("@/components/charts/CategoryChart").then((m) => m.CategoryChart),
  {
    loading: () => (
      <div className="flex h-[280px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    ),
    ssr: false,
  }
);

interface DashboardChartsProps {
  trend: { month: string; amount: number }[];
  byCategory: Record<string, { count: number; monthlyCost: number }>;
}

export function DashboardCharts({ trend, byCategory }: DashboardChartsProps) {
  const [view, setView] = useState<"line" | "pie">("line");

  const hasTrend = trend.some((t) => t.amount > 0);
  const hasCategories = Object.keys(byCategory).length > 0;

  if (!hasTrend && !hasCategories) return null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Analyse des dépenses
        </h2>
        <div className="flex gap-1 rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
          <Button
            variant={view === "line" ? "default" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setView("line")}
            aria-label="Graphique linéaire"
          >
            <BarChart3 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={view === "pie" ? "default" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setView("pie")}
            aria-label="Graphique circulaire"
          >
            <PieChartIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {view === "line" ? "Évolution de vos dépenses" : "Répartition par catégorie"}
        </h3>
        {view === "line" ? (
          <SpendingChart data={trend} />
        ) : (
          <CategoryChart data={byCategory} />
        )}
      </div>
    </div>
  );
}
