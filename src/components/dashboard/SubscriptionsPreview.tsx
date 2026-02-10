"use client";

import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { SubscriptionCard } from "@/components/subscriptions/SubscriptionCard";
import { Button } from "@/components/ui/button";

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

interface SubscriptionsPreviewProps {
  subscriptions: Subscription[];
  onConfirm: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function SubscriptionsPreview({
  subscriptions,
  onConfirm,
  onCancel,
  onDelete,
}: SubscriptionsPreviewProps) {
  if (subscriptions.length === 0) {
    return (
      <div>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Vos abonnements
        </h2>
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <Plus className="h-7 w-7 text-zinc-400" />
          </div>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Aucun abonnement détecté
          </h3>
          <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            Connectez votre banque et lancez la détection pour trouver automatiquement vos abonnements.
          </p>
          <Link href="/dashboard/subscriptions/new" className="mt-4">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Ajouter manuellement
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const preview = subscriptions.slice(0, 6);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Vos abonnements récents
        </h2>
        <Link href="/dashboard/subscriptions/new">
          <Button variant="ghost" size="sm" className="gap-1.5 text-sm">
            Voir tout
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {preview.map((sub) => (
          <SubscriptionCard
            key={sub.id}
            subscription={sub}
            onConfirm={onConfirm}
            onCancel={onCancel}
            onDelete={onDelete}
          />
        ))}
      </div>
      {subscriptions.length > 6 && (
        <div className="mt-4 text-center">
          <Link href="/dashboard/subscriptions/new">
            <Button variant="outline" size="sm" className="gap-1.5">
              Voir les {subscriptions.length} abonnements
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
