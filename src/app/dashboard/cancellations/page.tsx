"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Loader2,
  Clock,
  CheckCircle2,
  Send,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Scissors,
  Globe,
  Mail,
  Phone,
  FileText,
} from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";

interface CancellationRequest {
  id: string;
  status: string;
  method: string;
  sentAt: string | null;
  confirmedAt: string | null;
  effectiveDate: string | null;
  notes: string | null;
  createdAt: string;
  subscription: {
    id: string;
    merchantName: string;
    displayName: string | null;
    amount: number;
    frequency: string;
    category: string | null;
  };
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; dotColor: string; bg: string; border: string; text: string }> = {
  PENDING: { label: "En attente", icon: Clock, dotColor: "bg-zinc-400", bg: "bg-zinc-50 dark:bg-zinc-800/50", border: "border-zinc-200 dark:border-zinc-700", text: "text-zinc-600 dark:text-zinc-400" },
  SENT: { label: "Envoyée", icon: Send, dotColor: "bg-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800/50", text: "text-blue-700 dark:text-blue-400" },
  CONFIRMED: { label: "Confirmée", icon: CheckCircle2, dotColor: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800/50", text: "text-emerald-700 dark:text-emerald-400" },
  CANCELLED: { label: "Annulée", icon: XCircle, dotColor: "bg-zinc-300", bg: "bg-zinc-50 dark:bg-zinc-800/50", border: "border-zinc-200 dark:border-zinc-700", text: "text-zinc-500 dark:text-zinc-500" },
  FAILED: { label: "Échouée", icon: AlertTriangle, dotColor: "bg-red-500", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800/50", text: "text-red-700 dark:text-red-400" },
};

const METHOD_CONFIG: Record<string, { icon: typeof Globe; label: string }> = {
  ONLINE: { icon: Globe, label: "En ligne" },
  EMAIL: { icon: Mail, label: "E-mail" },
  PHONE: { icon: Phone, label: "Téléphone" },
  LETTER: { icon: FileText, label: "Courrier" },
};

const FILTERS = [
  { key: "ALL", label: "Toutes" },
  { key: "PENDING", label: "En attente" },
  { key: "SENT", label: "Envoyées" },
  { key: "CONFIRMED", label: "Confirmées" },
  { key: "CANCELLED", label: "Annulées" },
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

// Status timeline mini component
function StatusTimeline({ status }: { status: string }) {
  const steps = [
    { key: "PENDING", label: "Créée" },
    { key: "SENT", label: "Envoyée" },
    { key: "CONFIRMED", label: "Confirmée" },
  ];
  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const done = i <= currentIndex && status !== "CANCELLED" && status !== "FAILED";
        return (
          <div key={step.key} className="flex items-center gap-1">
            <div className={`h-1.5 w-1.5 rounded-full transition-colors ${done ? "bg-blue-500" : "bg-zinc-200 dark:bg-zinc-700"}`} />
            {i < steps.length - 1 && (
              <div className={`h-px w-4 transition-colors ${done && i < currentIndex ? "bg-blue-400" : "bg-zinc-200 dark:bg-zinc-700"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CancellationsContent() {
  const [requests, setRequests] = useState<CancellationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/cancellation/requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests ?? []);
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

  const filtered = useMemo(() => {
    if (filter === "ALL") return requests;
    return requests.filter((r) => r.status === filter);
  }, [requests, filter]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      await fetch(`/api/cancellation/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await fetchData();
    } catch {
      // ignore
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-zinc-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Hero */}
      <div className="border-b border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-3xl px-4 pb-6 pt-6">
          <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-300">
            <ArrowLeft className="h-4 w-4" />
            Tableau de bord
          </Link>

          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
              <Scissors className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Suivi des résiliations
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                {requests.length} demande{requests.length !== 1 ? "s" : ""} de résiliation
              </p>
            </div>
          </div>

          {/* Stats row — OverClarity style */}
          {requests.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "En attente", count: requests.filter((r) => r.status === "PENDING").length, color: "text-zinc-600 dark:text-zinc-400", bg: "bg-zinc-50 dark:bg-zinc-800/50" },
                { label: "Envoyées", count: requests.filter((r) => r.status === "SENT").length, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
                { label: "Confirmées", count: requests.filter((r) => r.status === "CONFIRMED").length, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                { label: "Économies", count: null, savings: requests.filter((r) => r.status === "CONFIRMED").reduce((s, r) => s + r.subscription.amount, 0), color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-900/20" },
              ].map((stat) => (
                <div key={stat.label} className={`rounded-xl border border-zinc-100 p-3 dark:border-zinc-800 ${stat.bg}`}>
                  <p className={`text-xs font-medium ${stat.color}`}>{stat.label}</p>
                  <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {stat.count !== null ? stat.count : `${formatCurrency(stat.savings ?? 0)}/mois`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* Filter pills */}
        {requests.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                  filter === f.key
                    ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-zinc-200/80 bg-white py-16 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
              <CheckCircle2 className="h-8 w-8 text-zinc-400" />
            </div>
            <div className="max-w-sm text-center">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {requests.length === 0 ? "Aucune demande de résiliation" : "Aucun résultat"}
              </h3>
              <p className="mt-2 text-sm text-zinc-500">
                {requests.length === 0
                  ? "Vos demandes de résiliation apparaîtront ici."
                  : "Aucune demande ne correspond à ce filtre."}
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="rounded-xl">Retour au tableau de bord</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req) => {
              const statusCfg = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.PENDING;
              const methodCfg = METHOD_CONFIG[req.method] ?? METHOD_CONFIG.ONLINE;
              const MethodIcon = methodCfg.icon;

              return (
                <div
                  key={req.id}
                  className="group overflow-hidden rounded-2xl border border-zinc-200/80 bg-white transition-all duration-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Method icon */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                        <MethodIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Title row */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          <Link
                            href={`/dashboard/subscriptions/${req.subscription.id}`}
                            className="text-sm font-bold text-zinc-900 transition-colors hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400"
                          >
                            {req.subscription.displayName ?? req.subscription.merchantName}
                          </Link>
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusCfg.bg} ${statusCfg.border} ${statusCfg.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dotColor}`} />
                            {statusCfg.label}
                          </span>
                          <span className="text-xs text-zinc-400">{methodCfg.label}</span>
                        </div>

                        {/* Info row */}
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">{formatCurrency(req.subscription.amount)}</span>
                          <span>Créée le {formatDate(req.createdAt)}</span>
                          {req.sentAt && <span>Envoyée le {formatDate(req.sentAt)}</span>}
                          {req.confirmedAt && <span className="text-emerald-600 dark:text-emerald-400">Confirmée le {formatDate(req.confirmedAt)}</span>}
                        </div>

                        {/* Timeline */}
                        <div className="mt-3">
                          <StatusTimeline status={req.status} />
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {req.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(req.id, "SENT")}
                              disabled={updating === req.id}
                              className="rounded-xl text-xs"
                            >
                              {updating === req.id ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <Send className="mr-1.5 h-3 w-3" />}
                              Marquer envoyée
                            </Button>
                          )}
                          {(req.status === "PENDING" || req.status === "SENT") && (
                            <Button
                              size="sm"
                              onClick={() => updateStatus(req.id, "CONFIRMED")}
                              disabled={updating === req.id}
                              className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-xs hover:from-emerald-700 hover:to-teal-700"
                            >
                              {updating === req.id ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-3 w-3" />}
                              Confirmer
                            </Button>
                          )}
                          {req.status !== "CONFIRMED" && req.status !== "CANCELLED" && (
                            <button
                              className="rounded-xl px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:text-red-500"
                              onClick={() => updateStatus(req.id, "CANCELLED")}
                              disabled={updating === req.id}
                            >
                              Annuler
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CancellationsPage() {
  return (
    <ProtectedRoute>
      <CancellationsContent />
    </ProtectedRoute>
  );
}
