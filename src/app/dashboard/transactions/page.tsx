"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Loader2, TrendingDown, TrendingUp, Wallet, Plus } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TransactionTable } from "@/components/bank/TransactionTable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Stats {
  totalTransactions: number;
  netBalance: number;
  totalDebit: number;
  totalCredit: number;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function TransactionsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState<Stats>({
    totalTransactions: 0,
    netBalance: 0,
    totalDebit: 0,
    totalCredit: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  const fetchTransactions = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("limit", "50");
        if (searchQuery) params.set("search", searchQuery);
        if (categoryFilter) params.set("category", categoryFilter);
        if (sourceFilter) params.set("source", sourceFilter);

        const res = await fetch(`/api/bank/transactions?${params}`);
        if (res.ok) {
          const data = await res.json();
          setTransactions(data.transactions);
          setPagination(data.pagination);
          setStats(data.stats);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, categoryFilter, sourceFilter]
  );

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchTransactions(1);
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchTransactions]);

  const handlePageChange = (page: number) => {
    fetchTransactions(page);
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Transactions
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Consultez et filtrez toutes vos transactions bancaires
            </p>
          </div>
          <Link href="/dashboard/bank/connect">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Importer
            </Button>
          </Link>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Total débits</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(stats.totalDebit)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Total crédits</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(stats.totalCredit)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Solde net</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(stats.netBalance)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction table */}
        {loading && transactions.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : stats.totalTransactions === 0 && !searchQuery && !categoryFilter && !sourceFilter ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 py-16 dark:border-zinc-700">
            <Wallet className="mb-4 h-12 w-12 text-zinc-400" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Aucune transaction
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Connectez votre banque ou importez un relevé pour commencer
            </p>
            <Link href="/dashboard/bank/connect" className="mt-4">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter des transactions
              </Button>
            </Link>
          </div>
        ) : (
          <TransactionTable
            transactions={transactions}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSearch={setSearchQuery}
            onCategoryFilter={setCategoryFilter}
            onSourceFilter={setSourceFilter}
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            sourceFilter={sourceFilter}
          />
        )}
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <ProtectedRoute>
      <TransactionsContent />
    </ProtectedRoute>
  );
}
