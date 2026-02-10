"use client";

import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BankError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Erreur de chargement
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Impossible de charger vos comptes bancaires. Veuillez réessayer.
        </p>
        {process.env.NODE_ENV === "development" && error.message && (
          <pre className="mt-3 max-w-full overflow-auto rounded-lg bg-zinc-100 p-3 text-left text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {error.message}
          </pre>
        )}
        <div className="mt-6 flex gap-3">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Tableau de bord
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
