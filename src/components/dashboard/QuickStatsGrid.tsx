"use client";

import {
  TrendingDown,
  CreditCard,
  PiggyBank,
  Calendar,
} from "lucide-react";

interface QuickStatsGridProps {
  totalMonthlyCost: number;
  activeCount: number;
  potentialSavings: number;
  nextRenewal: {
    merchantName: string;
    amount: number;
    nextChargeDate: string;
  } | null;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
}

const statCards = [
  {
    key: "cost",
    label: "Coût mensuel",
    sublabel: "en abonnements actifs",
    icon: TrendingDown,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-50 dark:bg-blue-900/20",
    valueColor: "text-zinc-900 dark:text-zinc-100",
    accentBorder: "border-t-blue-500",
  },
  {
    key: "active",
    label: "Abonnements actifs",
    sublabel: "abonnements détectés",
    icon: CreditCard,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
    valueColor: "text-zinc-900 dark:text-zinc-100",
    accentBorder: "border-t-emerald-500",
  },
  {
    key: "savings",
    label: "Économies possibles",
    sublabel: "en optimisant vos abonnements",
    icon: PiggyBank,
    iconColor: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-50 dark:bg-orange-900/20",
    valueColor: "text-orange-600 dark:text-orange-400",
    accentBorder: "border-t-orange-500",
  },
  {
    key: "next",
    label: "Prochain prélèvement",
    sublabel: "",
    icon: Calendar,
    iconColor: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-50 dark:bg-violet-900/20",
    valueColor: "text-zinc-900 dark:text-zinc-100",
    accentBorder: "border-t-violet-500",
  },
] as const;

export function QuickStatsGrid({
  totalMonthlyCost,
  activeCount,
  potentialSavings,
  nextRenewal,
}: QuickStatsGridProps) {
  const values: Record<string, { value: string; sub: string }> = {
    cost: {
      value: formatCurrency(totalMonthlyCost),
      sub: "en abonnements actifs",
    },
    active: {
      value: String(activeCount),
      sub: `abonnement${activeCount > 1 ? "s" : ""} détecté${activeCount > 1 ? "s" : ""}`,
    },
    savings: {
      value: potentialSavings > 0 ? `${formatCurrency(potentialSavings)}/mois` : "—",
      sub: potentialSavings > 0 ? "en optimisant vos abonnements" : "Aucune suggestion pour le moment",
    },
    next: {
      value: nextRenewal ? formatDate(nextRenewal.nextChargeDate) : "—",
      sub: nextRenewal
        ? `${nextRenewal.merchantName} — ${formatCurrency(nextRenewal.amount)}`
        : "Aucun prélèvement prévu",
    },
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        const data = values[card.key];
        return (
          <div
            key={card.key}
            className={`group rounded-xl border border-zinc-200 border-t-4 ${card.accentBorder} bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {card.label}
              </p>
            </div>
            <p className={`mt-3 text-3xl font-bold tracking-tight ${card.valueColor}`}>
              {data.value}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {data.sub}
            </p>
          </div>
        );
      })}
    </div>
  );
}
