"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { OnboardingCard } from "@/components/dashboard/OnboardingCard";
import { QuickStatsGrid } from "@/components/dashboard/QuickStatsGrid";
import { QuickActionsGrid } from "@/components/dashboard/QuickActionsGrid";
import { SubscriptionsPreview } from "@/components/dashboard/SubscriptionsPreview";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { AlertBanner } from "@/components/alerts/AlertBanner";
import { FooterLinks } from "@/components/dashboard/FooterLinks";

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

function DashboardContent() {
  const { data: session } = useSession();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [savings, setSavings] = useState<SavingsData | null>(null);
  const [bankCount, setBankCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [subsRes, statsRes, alertsRes, savingsRes, banksRes] = await Promise.all([
        fetch("/api/subscriptions"),
        fetch("/api/subscriptions/stats"),
        fetch("/api/subscriptions/alerts"),
        fetch("/api/savings"),
        fetch("/api/bank/connections"),
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
      if (banksRes.ok) {
        const data = await banksRes.json();
        setBankCount((data.connections ?? []).length);
      } else {
        setBankCount(0);
      }
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
    const res = await fetch("/api/subscriptions/detect", { method: "POST" });
    if (!res.ok) throw new Error("Detection failed");
    await fetchData();
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

  if (loading) {
    return <DashboardSkeleton />;
  }

  const hasBanks = (bankCount ?? 0) > 0;
  const hasSubscriptions = subscriptions.length > 0;
  const activeSubscriptions = subscriptions.filter((s) => s.status === "ACTIVE");
  const nextRenewal = stats?.upcoming?.[0] ?? null;

  // Determine last sync time from stats trend (approximate)
  const lastSyncAt = hasSubscriptions ? new Date().toISOString() : null;

  // Show onboarding if no banks OR no subscriptions
  const showOnboarding = !hasBanks || !hasSubscriptions;

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-6 dark:bg-zinc-950 sm:py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* A) Welcome Banner */}
        <WelcomeBanner userName={session?.user?.name} />

        {/* B) Onboarding (for new/incomplete users) */}
        {showOnboarding && (
          <OnboardingCard hasBanks={hasBanks} hasSubscriptions={hasSubscriptions} />
        )}

        {/* D) Alerts */}
        {alerts.length > 0 && <AlertBanner alerts={alerts} />}

        {/* C) Quick Stats (if user has data) */}
        {hasSubscriptions && (
          <QuickStatsGrid
            totalMonthlyCost={stats?.totalMonthlyCost ?? 0}
            activeCount={stats?.activeCount ?? 0}
            potentialSavings={savings?.totalMonthlySavings ?? 0}
            nextRenewal={nextRenewal}
          />
        )}

        {/* E) Quick Actions */}
        <QuickActionsGrid
          activeCount={activeSubscriptions.length}
          lastSyncAt={lastSyncAt}
          hasBanks={hasBanks}
          onDetect={handleDetect}
        />

        {/* F) Subscriptions Preview */}
        <SubscriptionsPreview
          subscriptions={activeSubscriptions}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onDelete={handleDelete}
        />

        {/* G) Charts */}
        {stats && (
          <DashboardCharts
            trend={stats.trend}
            byCategory={stats.byCategory}
          />
        )}

        {/* I) Footer Quick Links */}
        <FooterLinks />
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
