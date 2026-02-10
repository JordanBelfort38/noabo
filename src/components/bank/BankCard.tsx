"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Loader2,
  Building2,
  Eye,
  Unplug,
  ChevronDown,
  ChevronUp,
  Wallet,
  CreditCard,
  PiggyBank,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
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

export interface BankAccountInfo {
  name: string;
  balance: number | null;
  currency: string;
  type?: string;
  providerAccountId?: string;
}

export interface BankConnectionData {
  id: string;
  bankName: string | null;
  bankLogoUrl: string | null;
  status: string;
  lastSyncAt: string | null;
  provider: string;
  bankAccounts: BankAccountInfo[];
}

interface BankCardProps {
  connection: BankConnectionData;
  onSync: (connectionId: string) => Promise<void>;
  onDisconnect: (connectionId: string) => Promise<void>;
}

function getAccountIcon(type?: string) {
  switch (type) {
    case "savings":
      return <PiggyBank className="h-4 w-4 text-emerald-500" />;
    case "credit_card":
      return <CreditCard className="h-4 w-4 text-violet-500" />;
    default:
      return <Wallet className="h-4 w-4 text-blue-500" />;
  }
}

function formatBalance(cents: number | null, currency: string) {
  if (cents === null) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Jamais synchronisé";
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
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active":
      return (
        <Badge variant="success" className="gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Actif
        </Badge>
      );
    case "error":
      return (
        <Badge variant="destructive" className="gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Erreur
        </Badge>
      );
    case "expired":
      return (
        <Badge variant="warning" className="gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
          Expirée
        </Badge>
      );
    case "revoked":
      return (
        <Badge variant="secondary" className="gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
          Déconnecté
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export function BankCard({ connection, onSync, onDisconnect }: BankCardProps) {
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const totalBalance = connection.bankAccounts.reduce((sum, acc) => {
    if (acc.balance !== null) return sum + acc.balance;
    return sum;
  }, 0);
  const hasBalance = connection.bankAccounts.some((a) => a.balance !== null);
  const accountCount = connection.bankAccounts.length;
  const currency = connection.bankAccounts[0]?.currency ?? "EUR";

  const handleSync = async () => {
    setSyncing(true);
    try {
      await onSync(connection.id);
      toast.success("Synchronisation terminée", {
        description: "Vos transactions ont été mises à jour.",
      });
    } catch {
      toast.error("Échec de la synchronisation", {
        description: "Veuillez réessayer dans quelques instants.",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await onDisconnect(connection.id);
      toast.success("Banque déconnectée", {
        description: `${connection.bankName ?? "La banque"} a été déconnectée.`,
      });
    } catch {
      toast.error("Erreur lors de la déconnexion");
    } finally {
      setDisconnecting(false);
      setShowDisconnectDialog(false);
    }
  };

  return (
    <>
      <Card className="group overflow-hidden transition-all duration-200 hover:shadow-md hover:ring-1 hover:ring-zinc-200 dark:hover:ring-zinc-700">
        <CardContent className="p-0">
          {/* Main card content */}
          <div className="flex items-start gap-4 p-5">
            {/* Bank icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-50 text-sm font-bold text-zinc-600 dark:from-zinc-800 dark:to-zinc-800/50 dark:text-zinc-400">
              {connection.bankLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={connection.bankLogoUrl}
                  alt={connection.bankName ?? ""}
                  className="h-8 w-8 rounded-lg object-contain"
                />
              ) : (
                <Building2 className="h-6 w-6" />
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {connection.bankName ?? "Banque connectée"}
                </h3>
                <StatusBadge status={connection.status} />
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
                <span>
                  {accountCount} compte{accountCount > 1 ? "s" : ""}
                </span>
                {hasBalance && (
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {formatBalance(totalBalance, currency)}
                  </span>
                )}
                <span className="text-xs">
                  {formatRelativeTime(connection.lastSyncAt)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1.5">
              {connection.status !== "revoked" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSync}
                  disabled={syncing}
                  className="h-8 w-8 p-0"
                  title="Synchroniser"
                >
                  {syncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Link href="/dashboard/transactions">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="Voir les transactions"
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDisconnectDialog(true)}
                className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                title="Déconnecter"
              >
                <Unplug className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Expandable accounts section */}
          {accountCount > 0 && (
            <>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center justify-center gap-1 border-t border-zinc-100 px-5 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
              >
                {expanded ? (
                  <>
                    Masquer les comptes
                    <ChevronUp className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    Voir les {accountCount} compte{accountCount > 1 ? "s" : ""}
                    <ChevronDown className="h-3 w-3" />
                  </>
                )}
              </button>

              {expanded && (
                <div className="border-t border-zinc-100 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30">
                  {connection.bankAccounts.map((acc, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 border-b border-zinc-100 px-5 py-3 last:border-b-0 dark:border-zinc-800"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-zinc-800">
                        {getAccountIcon(acc.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {acc.name}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {formatBalance(acc.balance, acc.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Disconnect confirmation dialog */}
      <Dialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <DialogContent onClose={() => setShowDisconnectDialog(false)}>
          <DialogHeader>
            <DialogTitle>Déconnecter {connection.bankName ?? "cette banque"} ?</DialogTitle>
            <DialogDescription>
              Les transactions existantes seront conservées mais vous ne recevrez
              plus de mises à jour automatiques.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDisconnectDialog(false)}
              disabled={disconnecting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="gap-2"
            >
              {disconnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Déconnexion...
                </>
              ) : (
                <>
                  <Unplug className="h-4 w-4" />
                  Déconnecter
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
