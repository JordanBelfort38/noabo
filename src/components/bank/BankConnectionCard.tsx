"use client";

import { useState } from "react";
import { RefreshCw, Trash2, Loader2, Building2 } from "lucide-react";
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

interface BankConnectionCardProps {
  connection: {
    id: string;
    bankName: string | null;
    bankLogoUrl: string | null;
    status: string;
    lastSyncAt: string | null;
    provider: string;
    _count?: { bankAccounts: number };
    bankAccounts?: { name: string; balance: number | null; currency: string }[];
  };
  onSync: (connectionId: string) => Promise<void>;
  onDisconnect: (connectionId: string) => Promise<void>;
}

export function BankConnectionCard({
  connection,
  onSync,
  onDisconnect,
}: BankConnectionCardProps) {
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await onSync(connection.id);
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await onDisconnect(connection.id);
    } finally {
      setDisconnecting(false);
      setShowDisconnectDialog(false);
    }
  };

  const statusBadge = () => {
    switch (connection.status) {
      case "active":
        return <Badge variant="success">Actif</Badge>;
      case "error":
        return <Badge variant="destructive">Erreur</Badge>;
      case "expired":
        return <Badge variant="warning">Expiré</Badge>;
      case "revoked":
        return <Badge variant="secondary">Déconnecté</Badge>;
      default:
        return <Badge variant="secondary">{connection.status}</Badge>;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Jamais";
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatBalance = (cents: number | null, currency: string) => {
    if (cents === null) return "—";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
    }).format(cents / 100);
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <Building2 className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {connection.bankName ?? "Banque connectée"}
                </h3>
                {statusBadge()}
              </div>

              {connection.bankAccounts && connection.bankAccounts.length > 0 && (
                <div className="mt-2 space-y-1">
                  {connection.bankAccounts.map((acc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {acc.name}
                      </span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {formatBalance(acc.balance, acc.currency)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-2 text-xs text-zinc-500">
                Dernière synchronisation : {formatDate(connection.lastSyncAt)}
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              {connection.status !== "revoked" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={syncing}
                  className="gap-1"
                >
                  {syncing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                  <span className="hidden sm:inline">Synchroniser</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDisconnectDialog(true)}
                className="gap-1 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-3 w-3" />
                <span className="hidden sm:inline">Déconnecter</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <DialogContent onClose={() => setShowDisconnectDialog(false)}>
          <DialogHeader>
            <DialogTitle>Déconnecter cette banque ?</DialogTitle>
            <DialogDescription>
              La connexion à {connection.bankName ?? "cette banque"} sera supprimée.
              Vos transactions importées seront conservées.
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
            >
              {disconnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Déconnexion...
                </>
              ) : (
                "Déconnecter"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
