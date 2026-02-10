"use client";

import { useState } from "react";
import {
  ArrowUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category: string | null;
  merchantName: string | null;
  importSource: string;
  isRecurring: boolean;
  bankAccount?: { name: string } | null;
}

interface TransactionTableProps {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onSearch: (query: string) => void;
  onCategoryFilter: (category: string) => void;
  onSourceFilter: (source: string) => void;
  searchQuery: string;
  categoryFilter: string;
  sourceFilter: string;
}

const CATEGORIES: Record<string, { label: string; color: string }> = {
  subscription: { label: "Abonnement", color: "default" },
  groceries: { label: "Alimentation", color: "secondary" },
  transport: { label: "Transport", color: "secondary" },
  restaurant: { label: "Restaurant", color: "secondary" },
  health: { label: "Santé", color: "secondary" },
  housing: { label: "Logement", color: "secondary" },
  insurance: { label: "Assurance", color: "secondary" },
  telecom: { label: "Télécom", color: "secondary" },
  entertainment: { label: "Divertissement", color: "secondary" },
  shopping: { label: "Shopping", color: "secondary" },
};

const SOURCE_LABELS: Record<string, string> = {
  api: "API",
  csv: "CSV",
  pdf: "PDF",
  ofx: "OFX",
  manual: "Manuel",
};

function formatAmount(cents: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function TransactionTable({
  transactions,
  pagination,
  onPageChange,
  onSearch,
  onCategoryFilter,
  onSourceFilter,
  searchQuery,
  categoryFilter,
  sourceFilter,
}: TransactionTableProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleExportCsv = () => {
    const headers = ["Date", "Description", "Montant", "Catégorie", "Source"];
    const rows = transactions.map((tx) => [
      formatDate(tx.date),
      tx.description,
      (tx.amount / 100).toFixed(2),
      tx.category ? CATEGORIES[tx.category]?.label ?? tx.category : "",
      SOURCE_LABELS[tx.importSource] ?? tx.importSource,
    ]);

    const csv = [headers, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-no-abo-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Rechercher une transaction..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1"
          >
            <Filter className="h-3 w-3" />
            Filtres
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="gap-1"
          >
            <Download className="h-3 w-3" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilter(e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            aria-label="Filtrer par catégorie"
          >
            <option value="">Toutes les catégories</option>
            {Object.entries(CATEGORIES).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => onSourceFilter(e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            aria-label="Filtrer par source"
          >
            <option value="">Toutes les sources</option>
            {Object.entries(SOURCE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {(categoryFilter || sourceFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onCategoryFilter("");
                onSourceFilter("");
              }}
            >
              Réinitialiser
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1">
                  Date
                  <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                Description
              </th>
              <th className="hidden px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400 sm:table-cell">
                Catégorie
              </th>
              <th className="hidden px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400 md:table-cell">
                Source
              </th>
              <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">
                Montant
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-zinc-500"
                >
                  Aucune transaction trouvée
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800/50 dark:hover:bg-zinc-800/30"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {formatDate(tx.date)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {tx.merchantName ?? tx.description}
                        </p>
                        {tx.merchantName && tx.description !== tx.merchantName && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {tx.description}
                          </p>
                        )}
                      </div>
                      {tx.isRecurring && (
                        <Badge variant="default" className="shrink-0 text-[10px]">
                          Récurrent
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    {tx.category && CATEGORIES[tx.category] ? (
                      <Badge variant="secondary">
                        {CATEGORIES[tx.category].label}
                      </Badge>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <Badge variant="outline">
                      {SOURCE_LABELS[tx.importSource] ?? tx.importSource}
                    </Badge>
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-3 text-right font-medium ${
                      tx.amount >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-zinc-900 dark:text-zinc-100"
                    }`}
                  >
                    {tx.amount >= 0 ? "+" : ""}
                    {formatAmount(tx.amount, tx.currency)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {pagination.total} transaction(s) — Page {pagination.page} sur{" "}
            {pagination.totalPages}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
