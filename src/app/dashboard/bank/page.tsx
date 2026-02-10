"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PlusCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BankCard, type BankConnectionData } from "@/components/bank/BankCard";
import { BankEmptyState } from "@/components/bank/BankEmptyState";
import { BankStatsCards } from "@/components/bank/BankStatsCards";
import { BankCardSkeleton, BankStatsSkeleton } from "@/components/bank/BankCardSkeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

function BankDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [connections, setConnections] = useState<BankConnectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const successParam = searchParams.get("success");
  const errorParam = searchParams.get("error");

  // Show toast for callback results and clean URL
  useEffect(() => {
    if (successParam === "true") {
      toast.success("Connexion bancaire établie !", {
        description: "Vos transactions sont en cours de synchronisation.",
      });
      router.replace("/dashboard/bank", { scroll: false });
    } else if (errorParam) {
      const messages: Record<string, string> = {
        expired_state: "La session de connexion a expiré. Veuillez réessayer.",
        missing_params: "Paramètres manquants dans la réponse de la banque.",
        cancelled: "Connexion annulée. Vous pouvez réessayer quand vous le souhaitez.",
        connection_failed: "La connexion bancaire n'a pas pu être établie.",
        callback_failed: "Erreur lors de la connexion bancaire.",
      };
      toast.error("Erreur de connexion", {
        description: messages[errorParam] ?? "Une erreur inattendue est survenue.",
      });
      router.replace("/dashboard/bank", { scroll: false });
    }
  }, [successParam, errorParam, router]);

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/bank/connections");
      if (res.ok) {
        const data = await res.json();
        setConnections(data.connections ?? []);
      }
    } catch {
      setError("Erreur lors du chargement des connexions bancaires");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleSync = async (connectionId: string) => {
    const res = await fetch("/api/bank/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Erreur de synchronisation");
    }
    await fetchConnections();
  };

  const handleDisconnect = async (connectionId: string) => {
    const res = await fetch("/api/bank/disconnect", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Erreur de déconnexion");
    }
    setConnections((prev) => prev.filter((c) => c.id !== connectionId));
  };

  // Compute stats
  const bankCount = connections.length;
  const accountCount = connections.reduce((s, c) => s + c.bankAccounts.length, 0);
  const totalBalance = connections.reduce((s, c) => {
    return s + c.bankAccounts.reduce((a, acc) => a + (acc.balance ?? 0), 0);
  }, 0);
  const hasBalance = connections.some((c) => c.bankAccounts.some((a) => a.balance !== null));
  const lastSyncAt = connections.reduce<string | null>((latest, c) => {
    if (!c.lastSyncAt) return latest;
    if (!latest) return c.lastSyncAt;
    return c.lastSyncAt > latest ? c.lastSyncAt : latest;
  }, null);

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Mes comptes bancaires
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Connectez vos banques pour détecter automatiquement vos abonnements
            </p>
          </div>
          {connections.length > 0 && (
            <Link href="/dashboard/bank/connect">
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Connecter une banque
              </Button>
            </Link>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {loading && (
          <>
            <BankStatsSkeleton />
            <div className="grid gap-4 md:grid-cols-2">
              <BankCardSkeleton />
              <BankCardSkeleton />
            </div>
          </>
        )}

        {/* Content */}
        {!loading && connections.length === 0 && <BankEmptyState />}

        {!loading && connections.length > 0 && (
          <>
            {/* Stats */}
            <BankStatsCards
              bankCount={bankCount}
              accountCount={accountCount}
              lastSyncAt={lastSyncAt}
              totalBalance={hasBalance ? totalBalance : null}
            />

            {/* Bank cards grid */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Banques connectées
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {connections.map((conn) => (
                  <BankCard
                    key={conn.id}
                    connection={conn}
                    onSync={handleSync}
                    onDisconnect={handleDisconnect}
                  />
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/transactions">
                <Button variant="outline" size="sm">
                  Voir toutes les transactions
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Tableau de bord
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function BankDashboardPage() {
  return (
    <ProtectedRoute>
      <BankDashboardContent />
    </ProtectedRoute>
  );
}
