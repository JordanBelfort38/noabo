"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus, Building2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BankConnectionCard } from "@/components/bank/BankConnectionCard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BankAccountInfo {
  name: string;
  balance: number | null;
  currency: string;
}

interface Connection {
  id: string;
  bankName: string | null;
  bankLogoUrl: string | null;
  status: string;
  lastSyncAt: string | null;
  provider: string;
  bankAccounts: BankAccountInfo[];
}

function BankDashboardContent() {
  const searchParams = useSearchParams();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const successParam = searchParams.get("success");
  const errorParam = searchParams.get("error");

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
    setSyncMessage(null);
    try {
      const res = await fetch("/api/bank/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage(data.message);
        await fetchConnections();
      } else {
        setError(data.error ?? "Erreur de synchronisation");
      }
    } catch {
      setError("Erreur de connexion");
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      const res = await fetch("/api/bank/disconnect", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      });
      if (res.ok) {
        setConnections((prev) => prev.filter((c) => c.id !== connectionId));
      } else {
        const data = await res.json();
        setError(data.error ?? "Erreur de déconnexion");
      }
    } catch {
      setError("Erreur de connexion");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Mes comptes bancaires
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Gérez vos connexions bancaires et synchronisez vos transactions
            </p>
          </div>
          <Link href="/dashboard/bank/connect">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un compte
            </Button>
          </Link>
        </div>

        {/* Callback messages */}
        {successParam === "true" && (
          <Alert variant="success">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Connexion bancaire établie avec succès ! Vos transactions sont en cours de synchronisation.
            </AlertDescription>
          </Alert>
        )}

        {errorParam && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorParam === "expired_state"
                ? "La session de connexion a expiré. Veuillez réessayer."
                : errorParam === "missing_params"
                  ? "Paramètres manquants dans la réponse de la banque."
                  : "Erreur lors de la connexion bancaire. Veuillez réessayer."}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {syncMessage && (
          <Alert variant="success">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{syncMessage}</AlertDescription>
          </Alert>
        )}

        {/* Connections list */}
        {connections.length > 0 ? (
          <div className="space-y-3">
            {connections.map((conn) => (
              <BankConnectionCard
                key={conn.id}
                connection={conn}
                onSync={handleSync}
                onDisconnect={handleDisconnect}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 py-16 dark:border-zinc-700">
            <Building2 className="mb-4 h-12 w-12 text-zinc-400" />
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Aucun compte connecté
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Connectez votre banque pour détecter automatiquement vos abonnements
            </p>
            <Link href="/dashboard/bank/connect" className="mt-4">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Connecter ma banque
              </Button>
            </Link>
          </div>
        )}

        {/* Quick links */}
        {connections.length > 0 && (
          <div className="flex gap-3">
            <Link href="/dashboard/transactions">
              <Button variant="outline" size="sm">
                Voir les transactions
              </Button>
            </Link>
          </div>
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
