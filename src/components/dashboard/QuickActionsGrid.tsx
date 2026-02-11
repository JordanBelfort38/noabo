"use client";

import { useState } from "react";
import Link from "next/link";
import {
  List,
  Building2,
  RefreshCw,
  Scissors,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface QuickActionsGridProps {
  activeCount: number;
  lastSyncAt: string | null;
  hasBanks: boolean;
  onDetect: () => Promise<void>;
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Jamais";
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
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function QuickActionsGrid({
  activeCount,
  lastSyncAt,
  hasBanks,
  onDetect,
}: QuickActionsGridProps) {
  const [detecting, setDetecting] = useState(false);

  const handleDetect = async () => {
    setDetecting(true);
    try {
      await onDetect();
      toast.success("Détection terminée", {
        description: "Vos abonnements ont été mis à jour.",
      });
    } catch {
      toast.error("Erreur lors de la détection");
    } finally {
      setDetecting(false);
    }
  };

  const actions = [
    {
      key: "bank",
      icon: Building2,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
      title: hasBanks ? "Ajouter une banque" : "Connecter une banque",
      description: hasBanks ? "Ajoutez un autre compte bancaire" : "Importez vos transactions en toute sécurité",
      href: "/dashboard/bank/connect",
      buttonLabel: hasBanks ? "Ajouter" : "Connecter",
      highlight: !hasBanks,
    },
    {
      key: "subscriptions",
      icon: List,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      title: "Mes abonnements",
      description: activeCount > 0
        ? `${activeCount} abonnement${activeCount > 1 ? "s" : ""} actif${activeCount > 1 ? "s" : ""}`
        : "Voir vos abonnements",
      href: "/dashboard/subscriptions/new",
      buttonLabel: "Voir tout",
    },
    {
      key: "detect",
      icon: RefreshCw,
      iconColor: "text-violet-600 dark:text-violet-400",
      iconBg: "bg-violet-50 dark:bg-violet-900/20",
      title: "Détecter les abonnements",
      description: `Dernière analyse : ${formatRelativeTime(lastSyncAt)}`,
      action: handleDetect,
      buttonLabel: "Analyser",
    },
    {
      key: "cancel",
      icon: Scissors,
      iconColor: "text-orange-600 dark:text-orange-400",
      iconBg: "bg-orange-50 dark:bg-orange-900/20",
      title: "Résilier un abonnement",
      description: "Guides et modèles de résiliation",
      href: "/dashboard/cancellations",
      buttonLabel: "Voir les guides",
    },
  ];

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Actions rapides
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          const isDetect = action.key === "detect";

          const highlight = "highlight" in action && action.highlight;

          return (
            <div
              key={action.key}
              className={`group flex flex-col justify-between rounded-xl border p-5 transition-all hover:shadow-md ${
                highlight
                  ? "border-blue-300 bg-blue-50/50 ring-1 ring-blue-200 dark:border-blue-800 dark:bg-blue-950/30 dark:ring-blue-900"
                  : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
              <div>
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${action.iconBg}`}>
                  <Icon className={`h-5 w-5 ${action.iconColor}`} />
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {action.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {action.description}
                </p>
              </div>

              <div className="mt-4">
                {isDetect ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5"
                    onClick={handleDetect}
                    disabled={detecting}
                  >
                    {detecting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    {detecting ? "Analyse..." : action.buttonLabel}
                  </Button>
                ) : (
                  <Link href={action.href!}>
                    <Button variant={highlight ? "default" : "outline"} size="sm" className="w-full gap-1.5">
                      {highlight && <Building2 className="h-3.5 w-3.5" />}
                      {action.buttonLabel}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
