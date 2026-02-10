"use client";

import Link from "next/link";
import { Building2, Shield, Lock, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BankEmptyState() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
        <Building2 className="h-10 w-10 text-blue-600 dark:text-blue-400" />
      </div>

      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
        Aucun compte bancaire connecté
      </h3>
      <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        Connectez votre première banque pour commencer à suivre vos abonnements
        automatiquement et économiser de l&apos;argent.
      </p>

      <Link href="/dashboard/bank/connect" className="mt-8">
        <Button size="lg" className="gap-2 text-base">
          <PlusCircle className="h-5 w-5" />
          Connecter ma première banque
        </Button>
      </Link>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Shield className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          Connexion sécurisée DSP2
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Lock className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          Données chiffrées de bout en bout
        </div>
      </div>
    </div>
  );
}
