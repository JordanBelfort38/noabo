"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Globe,
  Mail,
  Phone,
  FileText,
  Shield,
  Clock,
  AlertCircle,
  Lightbulb,
  ChevronDown,
  Scissors,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CancellationStepper } from "@/components/cancellation/CancellationStepper";

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

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  EASY: { label: "Facile", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800/50", dot: "bg-emerald-500" },
  MEDIUM: { label: "Moyen", color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800/50", dot: "bg-orange-500" },
  HARD: { label: "Difficile", color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800/50", dot: "bg-red-500" },
};

const CATEGORY_LABELS: Record<string, string> = {
  streaming: "Streaming",
  software: "Logiciels",
  telecom: "Télécom",
  health: "Sport & Santé",
  insurance: "Assurance",
  housing: "Logement",
};

export default function MerchantCancelPage() {
  const params = useParams();
  const merchant = decodeURIComponent(params.merchant as string);

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFaq, setShowFaq] = useState<number | null>(null);

  const fetchTemplate = useCallback(async () => {
    try {
      const res = await fetch(`/api/cancellation/templates/${encodeURIComponent(merchant)}`);
      if (res.ok) {
        const data = await res.json();
        setTemplate(data.template);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [merchant]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
        <p className="text-zinc-500">Guide non trouvé pour &quot;{merchant}&quot;</p>
        <Link href="/help/cancel">
          <Button variant="outline" className="rounded-xl">Retour aux guides</Button>
        </Link>
      </div>
    );
  }

  const diff = DIFFICULTY_CONFIG[template.difficulty] ?? DIFFICULTY_CONFIG.MEDIUM;

  const methods = [
    { key: "online", icon: Globe, label: "En ligne", available: !!template.onlineUrl, detail: template.onlineUrl },
    { key: "email", icon: Mail, label: "Par e-mail", available: !!template.emailAddress, detail: template.emailAddress },
    { key: "phone", icon: Phone, label: "Par téléphone", available: !!template.phoneNumber, detail: template.phoneNumber },
    { key: "letter", icon: FileText, label: "Par courrier", available: !!template.postalAddress, detail: template.postalAddress },
  ].filter((m) => m.available);

  const faqs = [
    { q: `Combien de temps prend la résiliation de ${template.displayName} ?`, a: template.noticeRequired ? `Un préavis de ${template.noticeRequired} jours est requis. Comptez environ ${template.noticeRequired + 7} jours au total.` : "La résiliation prend effet immédiatement ou à la fin de la période de facturation en cours." },
    { q: "Y a-t-il des frais de résiliation ?", a: template.contractType === "Sans engagement" ? "Non, votre abonnement est sans engagement. Aucun frais de résiliation ne s'applique." : "Des frais peuvent s'appliquer si vous êtes encore sous engagement. Vérifiez votre contrat." },
    { q: "Quelle loi protège ma résiliation ?", a: template.lawReference ? `Votre résiliation est encadrée par la ${template.lawReference}. Cette loi vous garantit le droit de résilier dans les conditions prévues.` : "Le droit de la consommation français encadre les conditions de résiliation des abonnements." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Hero */}
      <div className="border-b border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-3xl px-4 pb-8 pt-6">
          <Link href="/help/cancel" className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-300">
            <ArrowLeft className="h-4 w-4" />
            Tous les guides
          </Link>

          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30">
              <Scissors className="h-7 w-7 text-red-600 dark:text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Comment résilier{" "}
                <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent dark:from-red-400 dark:to-orange-400">
                  {template.displayName}
                </span>
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                {CATEGORY_LABELS[template.category] ?? template.category} — Guide complet de résiliation
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${diff.color} ${diff.bg} ${diff.border}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${diff.dot}`} />
              {diff.label}
            </span>
            {template.contractType && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                {template.contractType}
              </span>
            )}
            {template.lawReference && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-800/50 dark:bg-blue-900/20 dark:text-blue-400">
                <Shield className="h-3 w-3" />
                {template.lawReference}
              </span>
            )}
            {template.noticeRequired && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:border-amber-800/50 dark:bg-amber-900/20 dark:text-amber-400">
                <Clock className="h-3 w-3" />
                Préavis {template.noticeRequired}j
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
        {/* Methods available */}
        <div>
          <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">Méthodes disponibles</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {methods.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.key} className="rounded-2xl border border-zinc-200/80 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                      <Icon className="h-4 w-4 text-zinc-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{m.label}</p>
                      <p className="truncate text-xs text-zinc-500">{m.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Requirements */}
        {template.requirements.length > 0 && (
          <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50 p-5 dark:border-amber-800/30 dark:from-amber-900/10 dark:to-orange-900/10">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300">Ce dont vous aurez besoin</h3>
                <ul className="mt-2 space-y-1.5">
                  {template.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300/80">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-5 text-lg font-bold text-zinc-900 dark:text-zinc-100">Étapes de résiliation</h2>
          <CancellationStepper steps={template.steps} />
        </div>

        {/* Tips */}
        {template.tips.length > 0 && (
          <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 dark:border-emerald-800/30 dark:from-emerald-900/10 dark:to-teal-900/10">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <Lightbulb className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">Conseils utiles</h3>
                <ul className="mt-2 space-y-1.5">
                  {template.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-emerald-800 dark:text-emerald-300/80">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* FAQ accordion */}
        <div>
          <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">Questions fréquentes</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <button
                  onClick={() => setShowFaq(showFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 ${showFaq === i ? "rotate-180" : ""}`} />
                </button>
                {showFaq === i && (
                  <div className="border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
          <h3 className="text-lg font-bold text-white">Prêt à résilier ?</h3>
          <p className="mt-1 text-sm text-blue-100">
            Connectez-vous pour accéder aux modèles de lettres et au suivi de résiliation.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/login">
              <Button className="rounded-xl bg-white text-blue-700 hover:bg-blue-50">
                Se connecter
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="rounded-xl border-white/30 text-white hover:bg-white/10">
                Créer un compte
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
