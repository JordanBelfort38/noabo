"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CreditCard,
  TrendingDown,
  Sparkles,
  Calendar,
  Plus,
  Search as SearchIcon,
  Loader2,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SubscriptionCard } from "@/components/subscriptions/SubscriptionCard";
import { EmptyState } from "@/components/subscriptions/EmptyState";
import { AlertBanner } from "@/components/alerts/AlertBanner";
import { SpendingChart } from "@/components/charts/SpendingChart";
import { CategoryChart } from "@/components/charts/CategoryChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Subscription {
  id: string;
  merchantName: string;
  displayName: string | null;
  amount: number;
  currency: string;
  frequency: string;
  category: string | null;
  status: string;
  confidence: number;
  nextChargeDate: string | null;
}

interface Stats {
  totalMonthlyCost: number;
  totalAnnualCost: number;
  activeCount: number;
  totalCount: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, { count: number; monthlyCost: number }>;
  topExpensive: { id: string; merchantName: string; monthlyCost: number }[];
  upcoming: { id: string; merchantName: string; amount: number; nextChargeDate: string }[];
  trend: { month: string; amount: number }[];
}

interface AlertItem {
  type: "renewal" | "commitment_ending" | "price_increase" | "inactive";
  severity: "info" | "warning" | "urgent" | "tip";
  subscriptionId: string;
  merchantName: string;
  message: string;
  date: string | null;
  amount?: number;
}

interface SavingsData {
  totalMonthlySavings: number;
  totalAnnualSavings: number;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function DashboardContent() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [savings, setSavings] = useState<SavingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [chartView, setChartView] = useState<"line" | "pie">("line");

  const fetchData = useCallback(async () => {
    try {
      const [subsRes, statsRes, alertsRes, savingsRes] = await Promise.all([
        fetch("/api/subscriptions"),
        fetch("/api/subscriptions/stats"),
        fetch("/api/subscriptions/alerts"),
        fetch("/api/savings"),
      ]);

      if (subsRes.ok) {
        const data = await subsRes.json();
        setSubscriptions(data.subscriptions ?? []);
      }
      if (statsRes.ok) setStats(await statsRes.json());
      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(data.alerts ?? []);
      }
      if (savingsRes.ok) setSavings(await savingsRes.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDetect = async () => {
    setDetecting(true);
    try {
      const res = await fetch("/api/subscriptions/detect", { method: "POST" });
      if (res.ok) {
        await fetchData();
      }
    } catch {
      // ignore
    } finally {
      setDetecting(false);
    }
  };

  const handleConfirm = async (id: string) => {
    await fetch(`/api/subscriptions/${id}/confirm`, { method: "POST" });
    await fetchData();
  };

  const handleCancel = async (id: string) => {
    await fetch(`/api/subscriptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELED" }),
    });
    await fetchData();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    await fetchData();
  };

  const filtered = subscriptions.filter((s) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "unconfirmed") return s.confidence < 100;
    return s.status === statusFilter;
  });

  // Find next upcoming renewal
  const nextRenewal = stats?.upcoming?.[0];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Tableau de bord
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Vue d&apos;ensemble de vos abonnements
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleDetect}
              disabled={detecting}
              className="gap-2"
            >
              {detecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SearchIcon className="h-4 w-4" />
              )}
              Détecter les abonnements
            </Button>
            <Link href="/dashboard/subscriptions/new">
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Ajouter</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Alerts */}
        <AlertBanner alerts={alerts} />

        {/* Hero Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Coût mensuel</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(stats?.totalMonthlyCost ?? 0)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Abonnements actifs</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {stats?.activeCount ?? 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Économies possibles</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(savings?.totalMonthlySavings ?? 0)}/mois
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Prochain prélèvement</p>
                {nextRenewal ? (
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {nextRenewal.merchantName}
                    <span className="ml-1 text-xs font-normal text-zinc-500">
                      {new Date(nextRenewal.nextChargeDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-zinc-500">—</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        {stats && (stats.trend.some((t) => t.amount > 0) || Object.keys(stats.byCategory).length > 0) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Évolution des dépenses</CardTitle>
              <div className="flex gap-1">
                <Button
                  variant={chartView === "line" ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setChartView("line")}
                  aria-label="Graphique linéaire"
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartView === "pie" ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setChartView("pie")}
                  aria-label="Graphique circulaire"
                >
                  <PieChartIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {chartView === "line" ? (
                <SpendingChart data={stats.trend} />
              ) : (
                <CategoryChart data={stats.byCategory} />
              )}
            </CardContent>
          </Card>
        )}

        {/* Subscriptions List */}
        <div>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">
                  Tous ({subscriptions.length})
                </TabsTrigger>
                <TabsTrigger value="ACTIVE">
                  Actifs ({stats?.byStatus?.ACTIVE ?? 0})
                </TabsTrigger>
                <TabsTrigger value="unconfirmed">
                  À vérifier ({subscriptions.filter((s) => s.confidence < 100).length})
                </TabsTrigger>
                <TabsTrigger value="CANCELED">
                  Résiliés ({stats?.byStatus?.CANCELED ?? 0})
                </TabsTrigger>
              </TabsList>
              <Link href="/dashboard/transactions" className="hidden sm:block">
                <Button variant="ghost" size="sm">
                  Voir les transactions
                </Button>
              </Link>
            </div>

            <TabsContent value={statusFilter} className="mt-4">
              {filtered.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {filtered.map((sub) => (
                    <SubscriptionCard
                      key={sub.id}
                      subscription={sub}
                      onConfirm={handleConfirm}
                      onCancel={handleCancel}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : subscriptions.length === 0 ? (
                <EmptyState />
              ) : (
                <EmptyState
                  title="Aucun résultat"
                  description="Aucun abonnement ne correspond à ce filtre."
                  showActions={false}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap gap-3 sm:hidden">
          <Link href="/dashboard/transactions">
            <Button variant="outline" size="sm">
              Transactions
            </Button>
          </Link>
          <Link href="/dashboard/cancellations">
            <Button variant="outline" size="sm">
              Résiliations
            </Button>
          </Link>
          <Link href="/dashboard/bank">
            <Button variant="outline" size="sm">
              Comptes bancaires
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
