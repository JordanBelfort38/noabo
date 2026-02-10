"use client";

import Link from "next/link";
import { CreditCard, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  showActions?: boolean;
}

export function EmptyState({
  title = "Aucun abonnement détecté",
  description = "Connectez votre compte bancaire ou importez un relevé pour commencer à détecter vos abonnements.",
  showActions = true,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 py-16 dark:border-zinc-700">
      <CreditCard className="mb-4 h-12 w-12 text-zinc-400" />
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-center text-sm text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
      {showActions && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard/bank/connect">
            <Button className="gap-2">
              <Upload className="h-4 w-4" />
              Connecter ma banque
            </Button>
          </Link>
          <Link href="/dashboard/subscriptions/new">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter manuellement
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
