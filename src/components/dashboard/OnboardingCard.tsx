"use client";

import Link from "next/link";
import {
  Building2,
  ScanSearch,
  LayoutDashboard,
  Shield,
  Lock,
  CheckCircle2,
  PlusCircle,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingCardProps {
  hasBanks: boolean;
  hasSubscriptions: boolean;
}

const steps = [
  {
    number: 1,
    key: "bank",
    icon: Building2,
    title: "Connectez votre banque",
    description: "Importez vos transactions de manière sécurisée via Open Banking",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    ring: "ring-blue-200 dark:ring-blue-800",
  },
  {
    number: 2,
    key: "detect",
    icon: ScanSearch,
    title: "Détection automatique",
    description: "Nous analysons vos transactions pour trouver vos abonnements",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    ring: "ring-violet-200 dark:ring-violet-800",
  },
  {
    number: 3,
    key: "manage",
    icon: LayoutDashboard,
    title: "Gérez et résiliez",
    description: "Visualisez, suivez et résiliez facilement vos abonnements",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    ring: "ring-emerald-200 dark:ring-emerald-800",
  },
];

export function OnboardingCard({ hasBanks, hasSubscriptions }: OnboardingCardProps) {
  const getStepStatus = (key: string) => {
    if (key === "bank") return hasBanks ? "done" : "current";
    if (key === "detect") return hasBanks ? (hasSubscriptions ? "done" : "current") : "pending";
    if (key === "manage") return hasSubscriptions ? "done" : "pending";
    return "pending";
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30">
          <Rocket className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Commencez en 3 étapes simples
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Configurez votre compte en quelques minutes
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step) => {
          const status = getStepStatus(step.key);
          const Icon = step.icon;
          const isDone = status === "done";
          const isCurrent = status === "current";

          return (
            <div
              key={step.key}
              className={`flex items-start gap-4 rounded-xl p-4 transition-all ${
                isCurrent
                  ? `${step.bg} ring-1 ${step.ring}`
                  : isDone
                    ? "bg-zinc-50 dark:bg-zinc-800/30"
                    : "opacity-50"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  isDone
                    ? "bg-green-100 dark:bg-green-900/30"
                    : isCurrent
                      ? step.bg
                      : "bg-zinc-100 dark:bg-zinc-800"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Icon className={`h-5 w-5 ${isCurrent ? step.color : "text-zinc-400"}`} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    isDone ? "text-green-600 dark:text-green-400" : isCurrent ? step.color : "text-zinc-400"
                  }`}>
                    Étape {step.number}
                  </span>
                  {isDone && (
                    <span className="text-xs text-green-600 dark:text-green-400">Terminé</span>
                  )}
                  {!isDone && !isCurrent && (
                    <span className="text-xs text-zinc-400">En attente</span>
                  )}
                </div>
                <h3 className={`mt-0.5 font-semibold ${isDone ? "text-zinc-500 line-through dark:text-zinc-500" : "text-zinc-900 dark:text-zinc-100"}`}>
                  {step.title}
                </h3>
                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      {!hasBanks && (
        <div className="mt-6">
          <Link href="/dashboard/bank/connect">
            <Button size="lg" className="w-full gap-2 text-base sm:w-auto">
              <PlusCircle className="h-5 w-5" />
              Connecter ma première banque
            </Button>
          </Link>
        </div>
      )}

      {hasBanks && !hasSubscriptions && (
        <div className="mt-6">
          <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
            Votre banque est connectée ! Lancez la détection de vos abonnements.
          </p>
        </div>
      )}

      {/* Security badges */}
      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-zinc-100 pt-5 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Lock className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          Connexion sécurisée DSP2
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Shield className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          Conforme RGPD
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          Données chiffrées
        </div>
      </div>
    </div>
  );
}
