"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, CreditCard, Calendar, Scissors } from "lucide-react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CancellationGuide } from "@/components/cancellation/CancellationGuide";
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
  nextChargeDate: string | null;
  commitmentEndDate: string | null;
}

interface Template {
  id: string;
  merchantName: string;
  displayName: string;
  category: string;
  onlineUrl: string | null;
  emailAddress: string | null;
  phoneNumber: string | null;
  postalAddress: string | null;
  difficulty: string;
  requiresCall: boolean;
  requiresLetter: boolean;
  noticeRequired: number | null;
  emailTemplate: string | null;
  letterTemplate: string | null;
  steps: string[];
  requirements: string[];
  tips: string[];
  lawReference: string | null;
  contractType: string | null;
}

const FREQ_LABELS: Record<string, string> = {
  WEEKLY: "/ semaine",
  BIWEEKLY: "/ 2 sem.",
  MONTHLY: "/ mois",
  BIMONTHLY: "/ 2 mois",
  QUARTERLY: "/ trimestre",
  SEMIANNUAL: "/ semestre",
  ANNUAL: "/ an",
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function CancelSubscriptionContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [noTemplate, setNoTemplate] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const subRes = await fetch(`/api/subscriptions/${id}`);
      if (!subRes.ok) return;
      const subData = await subRes.json();
      const sub = subData.subscription;
      setSubscription(sub);

      const tplRes = await fetch(
        `/api/cancellation/templates/${encodeURIComponent(sub.merchantName)}`
      );
      if (tplRes.ok) {
        const tplData = await tplRes.json();
        setTemplate(tplData.template);
      } else {
        setNoTemplate(true);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRequestCreated = () => {
    router.push("/dashboard/cancellations");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-zinc-500">Chargement du guide...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
        <p className="text-zinc-500">Abonnement non trouvé</p>
        <Link href="/dashboard">
          <Button variant="outline" className="rounded-xl">Retour au tableau de bord</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Hero section */}
      <div className="border-b border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-3xl px-4 pb-8 pt-6">
          <Link href={`/dashboard/subscriptions/${id}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-300">
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;abonnement
          </Link>

          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30">
              <Scissors className="h-7 w-7 text-red-600 dark:text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Résilier{" "}
                <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent dark:from-red-400 dark:to-orange-400">
                  {subscription.displayName ?? subscription.merchantName}
                </span>
              </h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Guide de résiliation pas à pas
              </p>
            </div>
          </div>

          {/* Subscription info cards — OverClarity stat card style */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <CreditCard className="h-3.5 w-3.5" />
                Montant
              </div>
              <p className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {formatCurrency(subscription.amount)}
                <span className="ml-1 text-xs font-normal text-zinc-400">{FREQ_LABELS[subscription.frequency] ?? ""}</span>
              </p>
            </div>
            {subscription.nextChargeDate && (
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/50">
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <Calendar className="h-3.5 w-3.5" />
                  Prochain prélèvement
                </div>
                <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatDate(subscription.nextChargeDate)}
                </p>
              </div>
            )}
            {subscription.commitmentEndDate && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 dark:border-amber-800/50 dark:bg-amber-900/10">
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Fin d&apos;engagement
                </div>
                <p className="mt-1 text-sm font-semibold text-amber-900 dark:text-amber-300">
                  {formatDate(subscription.commitmentEndDate)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guide content */}
      <div className="mx-auto max-w-3xl px-4 py-8">
        {template ? (
          <CancellationGuide
            template={template}
            subscriptionId={subscription.id}
            onRequestCreated={handleRequestCreated}
          />
        ) : noTemplate ? (
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-zinc-200/80 bg-white py-16 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
              <AlertCircle className="h-8 w-8 text-zinc-400" />
            </div>
            <div className="max-w-sm text-center">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Aucun guide disponible
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Nous n&apos;avons pas encore de guide de résiliation pour{" "}
                <strong className="text-zinc-700 dark:text-zinc-300">{subscription.merchantName}</strong>.
                Essayez de contacter directement le service client.
              </p>
            </div>
            {subscription.category === "telecom" && (
              <div className="rounded-xl bg-blue-50 px-4 py-3 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                💡 Pour les opérateurs télécom, demandez votre code RIO au <strong>3179</strong>
              </div>
            )}
            <Link href={`/dashboard/subscriptions/${id}`}>
              <Button variant="outline" className="rounded-xl">Retour</Button>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function CancelSubscriptionPage() {
  return (
    <ProtectedRoute>
      <CancelSubscriptionContent />
    </ProtectedRoute>
  );
}
