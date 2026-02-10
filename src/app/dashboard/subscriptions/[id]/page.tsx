"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Check,
  Loader2,
  Calendar,
  CreditCard,
  TrendingUp,
  Clock,
  Scissors,
} from "lucide-react";

import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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
  lastChargeDate: string | null;
  firstChargeDate: string | null;
  commitmentEndDate: string | null;
  cancellationUrl: string | null;
  notes: string | null;
  transactionIds: string[];
  createdAt: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
}

const FREQUENCY_LABELS: Record<string, string> = {
  WEEKLY: "Hebdomadaire",
  BIWEEKLY: "Bi-hebdomadaire",
  MONTHLY: "Mensuel",
  BIMONTHLY: "Bimestriel",
  QUARTERLY: "Trimestriel",
  SEMIANNUAL: "Semestriel",
  ANNUAL: "Annuel",
};

const STATUS_BADGE: Record<string, { label: string; variant: "success" | "warning" | "secondary" }> = {
  ACTIVE: { label: "Actif", variant: "success" },
  PAUSED: { label: "En pause", variant: "warning" },
  CANCELED: { label: "Résilié", variant: "secondary" },
  ENDING_SOON: { label: "Fin proche", variant: "warning" },
};

const MONTHLY_MULTIPLIERS: Record<string, number> = {
  WEEKLY: 52 / 12,
  BIWEEKLY: 26 / 12,
  MONTHLY: 1,
  BIMONTHLY: 0.5,
  QUARTERLY: 1 / 3,
  SEMIANNUAL: 1 / 6,
  ANNUAL: 1 / 12,
};

function formatCurrency(cents: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(cents / 100);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function SubscriptionDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [sub, setSub] = useState<Subscription | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/subscriptions/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSub(data.subscription);
        setTransactions(data.transactions ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConfirm = async () => {
    const res = await fetch(`/api/subscriptions/${id}/confirm`, { method: "POST" });
    if (res.ok) {
      toast.success("Abonnement confirmé");
    } else {
      toast.error("Erreur lors de la confirmation");
    }
    await fetchData();
  };

  const handleDelete = async () => {
    setDeleting(true);
    const res = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Abonnement supprimé");
    } else {
      toast.error("Erreur lors de la suppression");
    }
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!sub) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-zinc-500">Abonnement non trouvé</p>
        <Link href="/dashboard">
          <Button variant="outline">Retour au tableau de bord</Button>
        </Link>
      </div>
    );
  }

  const statusInfo = STATUS_BADGE[sub.status] ?? { label: sub.status, variant: "secondary" as const };
  const monthlyCost = Math.round(sub.amount * (MONTHLY_MULTIPLIERS[sub.frequency] ?? 1));
  const annualCost = monthlyCost * 12;
  const totalSpent = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
            </Link>
          </div>
          <div className="flex gap-2">
            {sub.confidence < 100 && (
              <Button variant="outline" size="sm" className="gap-1" onClick={handleConfirm}>
                <Check className="h-4 w-4" />
                Confirmer
              </Button>
            )}
            {sub.status === "ACTIVE" && (
              <Link href={`/dashboard/subscriptions/${id}/cancel`}>
                <Button variant="outline" size="sm" className="gap-1 text-red-600 hover:bg-red-50 dark:text-red-400">
                  <Scissors className="h-4 w-4" />
                  Résilier
                </Button>
              </Link>
            )}
            <Link href={`/dashboard/subscriptions/${id}/edit`}>
              <Button variant="outline" size="sm" className="gap-1">
                <Edit className="h-4 w-4" />
                Modifier
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-red-600 hover:bg-red-50 dark:text-red-400"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </div>

        {/* Main info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xl font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {(sub.displayName ?? sub.merchantName).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {sub.displayName ?? sub.merchantName}
                  </h1>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  {sub.confidence < 100 && <Badge variant="warning">Confiance : {sub.confidence}%</Badge>}
                </div>
                <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(sub.amount, sub.currency)}
                  <span className="ml-1 text-base font-normal text-zinc-500">
                    /{FREQUENCY_LABELS[sub.frequency]?.toLowerCase() ?? sub.frequency}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-zinc-500">Prochain prélèvement</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {formatDate(sub.nextChargeDate)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-zinc-500">Abonné depuis</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {formatDate(sub.firstChargeDate)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <CreditCard className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-xs text-zinc-500">Coût annuel estimé</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(annualCost)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-xs text-zinc-500">Total dépensé</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(totalSpent)} ({transactions.length} transactions)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commitment */}
        {sub.commitmentEndDate && (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                <strong>Fin d&apos;engagement :</strong> {formatDate(sub.commitmentEndDate)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Pensez à résilier avant cette date si vous ne souhaitez pas renouveler.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {sub.notes && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                {sub.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Transaction history */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historique des transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {tx.description}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {new Date(tx.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(tx.amount, tx.currency)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-zinc-500">
                Aucune transaction associée
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent onClose={() => setShowDeleteDialog(false)}>
          <DialogHeader>
            <DialogTitle>Supprimer cet abonnement ?</DialogTitle>
            <DialogDescription>
              L&apos;abonnement {sub.displayName ?? sub.merchantName} sera supprimé définitivement.
              Les transactions associées seront conservées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SubscriptionDetailPage() {
  return (
    <ProtectedRoute>
      <SubscriptionDetailContent />
    </ProtectedRoute>
  );
}
