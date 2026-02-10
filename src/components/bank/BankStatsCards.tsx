"use client";

import { Building2, CreditCard, RefreshCw, ArrowDownUp } from "lucide-react";

interface BankStatsCardsProps {
  bankCount: number;
  accountCount: number;
  lastSyncAt: string | null;
  totalBalance: number | null;
  currency?: string;
}

function formatBalance(cents: number | null, currency: string) {
  if (cents === null) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Jamais";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffH < 24) return `Il y a ${diffH}h`;
  if (diffD < 7) return `Il y a ${diffD}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

const stats = [
  {
    key: "banks",
    icon: Building2,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    key: "accounts",
    icon: CreditCard,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-900/20",
  },
  {
    key: "balance",
    icon: ArrowDownUp,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    key: "sync",
    icon: RefreshCw,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
] as const;

export function BankStatsCards({
  bankCount,
  accountCount,
  lastSyncAt,
  totalBalance,
  currency = "EUR",
}: BankStatsCardsProps) {
  const items = [
    { ...stats[0], label: "Banque" + (bankCount > 1 ? "s" : ""), value: String(bankCount) },
    { ...stats[1], label: "Compte" + (accountCount > 1 ? "s" : ""), value: String(accountCount) },
    { ...stats[2], label: "Solde total", value: formatBalance(totalBalance, currency) },
    { ...stats[3], label: "Dernière synchro", value: formatRelativeTime(lastSyncAt) },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.key}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
              <Icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {item.value}
              </p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {item.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
