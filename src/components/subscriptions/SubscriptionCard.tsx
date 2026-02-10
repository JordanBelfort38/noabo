"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MoreVertical,
  Check,
  Edit,
  Trash2,
  XCircle,
  Eye,
  Loader2,
  Scissors,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SubscriptionCardProps {
  subscription: {
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
  };
  onConfirm?: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const CATEGORY_COLORS: Record<string, string> = {
  subscription: "border-l-red-500",
  streaming: "border-l-red-500",
  software: "border-l-blue-500",
  telecom: "border-l-indigo-500",
  housing: "border-l-green-500",
  insurance: "border-l-purple-500",
  health: "border-l-pink-500",
  transport: "border-l-cyan-500",
  entertainment: "border-l-orange-500",
  shopping: "border-l-teal-500",
  groceries: "border-l-emerald-500",
  restaurant: "border-l-amber-500",
};

const CATEGORY_LABELS: Record<string, string> = {
  subscription: "Abonnement",
  streaming: "Streaming",
  software: "Logiciel",
  telecom: "Télécom",
  housing: "Logement",
  insurance: "Assurance",
  health: "Santé",
  transport: "Transport",
  entertainment: "Divertissement",
  shopping: "Shopping",
  groceries: "Alimentation",
  restaurant: "Restaurant",
};

const FREQUENCY_SHORT: Record<string, string> = {
  WEEKLY: "/sem",
  BIWEEKLY: "/2 sem",
  MONTHLY: "/mois",
  BIMONTHLY: "/2 mois",
  QUARTERLY: "/trim",
  SEMIANNUAL: "/sem",
  ANNUAL: "/an",
};

const STATUS_BADGE: Record<string, { label: string; variant: "success" | "warning" | "secondary" | "destructive" }> = {
  ACTIVE: { label: "Actif", variant: "success" },
  PAUSED: { label: "Pause", variant: "warning" },
  CANCELED: { label: "Résilié", variant: "secondary" },
  ENDING_SOON: { label: "Fin proche", variant: "warning" },
};

function formatAmount(cents: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export function SubscriptionCard({
  subscription: sub,
  onConfirm,
  onCancel,
  onDelete,
}: SubscriptionCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const borderColor = CATEGORY_COLORS[sub.category ?? ""] ?? "border-l-zinc-300";
  const statusInfo = STATUS_BADGE[sub.status] ?? { label: sub.status, variant: "secondary" as const };
  const needsConfirmation = sub.confidence < 100;

  const handleAction = async (action: string, fn?: (id: string) => Promise<void>) => {
    if (!fn) return;
    setLoading(action);
    setMenuOpen(false);
    try {
      await fn(sub.id);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className={`border-l-4 ${borderColor} transition-shadow hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Logo placeholder */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {(sub.displayName ?? sub.merchantName).charAt(0).toUpperCase()}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                {sub.displayName ?? sub.merchantName}
              </h3>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              {needsConfirmation && (
                <Badge variant="warning">À confirmer</Badge>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
              {sub.category && (
                <span>{CATEGORY_LABELS[sub.category] ?? sub.category}</span>
              )}
              {sub.nextChargeDate && (
                <span>Prochain : {formatDate(sub.nextChargeDate)}</span>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {formatAmount(sub.amount, sub.currency)}
            </p>
            <p className="text-xs text-zinc-500">
              {FREQUENCY_SHORT[sub.frequency] ?? ""}
            </p>
          </div>

          {/* Menu */}
          <div className="relative shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Actions"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-1 w-48 rounded-md border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                  <Link
                    href={`/dashboard/subscriptions/${sub.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Eye className="h-4 w-4" />
                    Voir les détails
                  </Link>
                  <Link
                    href={`/dashboard/subscriptions/${sub.id}/edit`}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Edit className="h-4 w-4" />
                    Modifier
                  </Link>
                  {sub.status === "ACTIVE" && (
                    <Link
                      href={`/dashboard/subscriptions/${sub.id}/cancel`}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-zinc-50 dark:text-red-400 dark:hover:bg-zinc-800"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Scissors className="h-4 w-4" />
                      Résilier
                    </Link>
                  )}
                  {needsConfirmation && onConfirm && (
                    <button
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-zinc-50 dark:text-green-400 dark:hover:bg-zinc-800"
                      onClick={() => handleAction("confirm", onConfirm)}
                      disabled={loading === "confirm"}
                    >
                      {loading === "confirm" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Confirmer
                    </button>
                  )}
                  {sub.status === "ACTIVE" && onCancel && (
                    <button
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-zinc-50 dark:text-orange-400 dark:hover:bg-zinc-800"
                      onClick={() => handleAction("cancel", onCancel)}
                      disabled={loading === "cancel"}
                    >
                      {loading === "cancel" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      Marquer comme résilié
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-zinc-50 dark:text-red-400 dark:hover:bg-zinc-800"
                      onClick={() => handleAction("delete", onDelete)}
                      disabled={loading === "delete"}
                    >
                      {loading === "delete" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Supprimer
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
