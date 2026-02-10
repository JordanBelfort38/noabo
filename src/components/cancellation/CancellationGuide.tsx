"use client";

import { useState } from "react";
import {
  Globe,
  Mail,
  Phone,
  FileText,
  Shield,
  Lightbulb,
  Copy,
  Check,
  Download,
  ExternalLink,
  Loader2,
  Clock,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CancellationStepper } from "./CancellationStepper";

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

interface CancellationGuideProps {
  template: Template;
  subscriptionId: string;
  userName?: string;
  userEmail?: string;
  onRequestCreated?: () => void;
}

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  EASY: { label: "Facile", color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800/50" },
  MEDIUM: { label: "Moyen", color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800/50" },
  HARD: { label: "Difficile", color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800/50" },
};

const METHOD_CONFIG: Record<string, { icon: typeof Globe; label: string; time: string; desc: string; gradient: string; iconBg: string }> = {
  ONLINE: { icon: Globe, label: "En ligne", time: "~5 min", desc: "Résiliation directe sur le site du service", gradient: "from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10", iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" },
  EMAIL: { icon: Mail, label: "Par e-mail", time: "~15 min", desc: "Envoyez un e-mail de résiliation pré-rédigé", gradient: "from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10", iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" },
  PHONE: { icon: Phone, label: "Par téléphone", time: "~30 min", desc: "Appelez le service client pour résilier", gradient: "from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10", iconBg: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400" },
  LETTER: { icon: FileText, label: "Par courrier", time: "2-3 jours", desc: "Lettre recommandée avec accusé de réception", gradient: "from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10", iconBg: "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400" },
};

export function CancellationGuide({
  template,
  subscriptionId,
  userName = "",
  userEmail = "",
  onRequestCreated,
}: CancellationGuideProps) {
  const [activeMethod, setActiveMethod] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showLegal, setShowLegal] = useState(false);

  const [senderName, setSenderName] = useState(userName);
  const [senderAddress, setSenderAddress] = useState("");
  const [senderPostalCode, setSenderPostalCode] = useState("");
  const [senderCity, setSenderCity] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");

  const difficultyInfo = DIFFICULTY_CONFIG[template.difficulty] ?? DIFFICULTY_CONFIG.MEDIUM;

  const methods = [
    { key: "ONLINE", available: !!template.onlineUrl },
    { key: "EMAIL", available: !!template.emailAddress || !!template.emailTemplate },
    { key: "PHONE", available: !!template.phoneNumber },
    { key: "LETTER", available: !!template.postalAddress || !!template.letterTemplate },
  ].filter((m) => m.available);

  const handleGenerateText = async (type: "email" | "letter") => {
    setGenerating(true);
    try {
      const res = await fetch("/api/cancellation/letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantName: template.merchantName,
          type,
          senderName: senderName || userName,
          senderAddress,
          senderPostalCode,
          senderCity,
          senderEmail: userEmail,
          customerNumber: customerNumber || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedText(data.text);
      }
    } catch { /* ignore */ } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedText) return;
    await navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedText) return;
    const blob = new Blob([generatedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lettre-resiliation-${template.merchantName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateRequest = async (method: string) => {
    setCreating(true);
    try {
      const res = await fetch("/api/cancellation/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId, method }),
      });
      if (res.ok) onRequestCreated?.();
    } catch { /* ignore */ } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Info badges row */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${difficultyInfo.color} ${difficultyInfo.bg} ${difficultyInfo.border}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${template.difficulty === "EASY" ? "bg-emerald-500" : template.difficulty === "MEDIUM" ? "bg-orange-500" : "bg-red-500"}`} />
          {difficultyInfo.label}
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

      {/* Requirements alert */}
      {template.requirements.length > 0 && (
        <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50 p-5 dark:border-amber-800/30 dark:from-amber-900/10 dark:to-orange-900/10">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                Préparez avant de commencer
              </h3>
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

      {/* Method selector — OverClarity-style cards */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Choisissez votre méthode
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {methods.map(({ key }) => {
            const cfg = METHOD_CONFIG[key];
            if (!cfg) return null;
            const Icon = cfg.icon;
            const isActive = activeMethod === key;

            return (
              <button
                key={key}
                onClick={() => {
                  setActiveMethod(isActive ? null : key);
                  setGeneratedText(null);
                }}
                className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ${
                  isActive
                    ? `border-blue-300 bg-gradient-to-br ${cfg.gradient} shadow-lg shadow-blue-100/50 dark:border-blue-700 dark:shadow-blue-900/20`
                    : `border-zinc-200/80 bg-white hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700`
                }`}
              >
                {isActive && (
                  <div className="absolute right-3 top-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                      <Check className="h-3 w-3" />
                    </div>
                  </div>
                )}
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${cfg.iconBg} transition-transform duration-200 group-hover:scale-110`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {cfg.label}
                </h3>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {cfg.desc}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-400">
                  <Clock className="h-3 w-3" />
                  {cfg.time}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active method detail panel */}
      {activeMethod && (
        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Online */}
          {activeMethod === "ONLINE" && template.onlineUrl && (
            <div className="p-6">
              <h3 className="mb-4 text-base font-bold text-zinc-900 dark:text-zinc-100">Résiliation en ligne</h3>
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                Cliquez sur le lien ci-dessous pour accéder directement à la page de résiliation :
              </p>
              <a
                href={template.onlineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 text-sm font-medium text-blue-700 transition-colors hover:from-blue-100 hover:to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-400"
              >
                <ExternalLink className="h-4 w-4" />
                {template.onlineUrl}
              </a>
              <div className="mt-4">
                <Button onClick={() => handleCreateRequest("ONLINE")} disabled={creating} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 hover:from-blue-700 hover:to-indigo-700">
                  {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  C&apos;est fait, j&apos;ai résilié en ligne
                </Button>
              </div>
            </div>
          )}

          {/* Email */}
          {activeMethod === "EMAIL" && (
            <div className="p-6">
              <h3 className="mb-4 text-base font-bold text-zinc-900 dark:text-zinc-100">Résiliation par e-mail</h3>
              {template.emailAddress && (
                <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                  Envoyez un e-mail à : <span className="font-semibold text-zinc-900 dark:text-zinc-100">{template.emailAddress}</span>
                </p>
              )}
              <div className="mb-4 space-y-2">
                <Label htmlFor="customerNumber" className="text-xs font-medium text-zinc-500">Numéro client (optionnel)</Label>
                <Input id="customerNumber" value={customerNumber} onChange={(e) => setCustomerNumber(e.target.value)} placeholder="Votre numéro client" className="rounded-xl" />
              </div>
              <Button size="sm" onClick={() => handleGenerateText("email")} disabled={generating} className="rounded-xl">
                {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                Générer l&apos;e-mail
              </Button>
              {generatedText && (
                <div className="mt-5 space-y-3">
                  <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-800">
                      <span className="text-xs font-medium text-zinc-500">Aperçu de l&apos;e-mail</span>
                    </div>
                    <pre className="max-h-64 overflow-auto p-4 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">{generatedText}</pre>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={handleCopy} className="rounded-xl">
                      {copied ? <Check className="mr-1.5 h-3.5 w-3.5 text-green-500" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                      {copied ? "Copié !" : "Copier le texte"}
                    </Button>
                    <Button size="sm" onClick={() => handleCreateRequest("EMAIL")} disabled={creating} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                      J&apos;ai envoyé l&apos;e-mail
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Phone */}
          {activeMethod === "PHONE" && template.phoneNumber && (
            <div className="p-6">
              <h3 className="mb-4 text-base font-bold text-zinc-900 dark:text-zinc-100">Résiliation par téléphone</h3>
              <div className="mb-5 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4 dark:from-violet-900/20 dark:to-purple-900/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/40">
                  <Phone className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <span className="text-2xl font-bold text-violet-900 dark:text-violet-300">{template.phoneNumber}</span>
              </div>
              <div className="mt-4">
                <Button onClick={() => handleCreateRequest("PHONE")} disabled={creating} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  J&apos;ai appelé et résilié
                </Button>
              </div>
            </div>
          )}

          {/* Letter */}
          {activeMethod === "LETTER" && (
            <div className="p-6">
              <h3 className="mb-4 text-base font-bold text-zinc-900 dark:text-zinc-100">Résiliation par courrier recommandé</h3>
              {template.postalAddress && (
                <div className="mb-5 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 p-4 dark:from-orange-900/10 dark:to-amber-900/10">
                  <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Adresse du destinataire</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{template.postalAddress}</p>
                </div>
              )}
              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="senderName" className="text-xs font-medium text-zinc-500">Votre nom *</Label>
                  <Input id="senderName" value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Jean Dupont" className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="letterCustomerNumber" className="text-xs font-medium text-zinc-500">Numéro client</Label>
                  <Input id="letterCustomerNumber" value={customerNumber} onChange={(e) => setCustomerNumber(e.target.value)} placeholder="Optionnel" className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="senderAddress" className="text-xs font-medium text-zinc-500">Adresse *</Label>
                  <Input id="senderAddress" value={senderAddress} onChange={(e) => setSenderAddress(e.target.value)} placeholder="12 rue de la Paix" className="rounded-xl" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor="senderPostalCode" className="text-xs font-medium text-zinc-500">Code postal *</Label>
                    <Input id="senderPostalCode" value={senderPostalCode} onChange={(e) => setSenderPostalCode(e.target.value)} placeholder="75001" className="rounded-xl" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor="senderCity" className="text-xs font-medium text-zinc-500">Ville *</Label>
                    <Input id="senderCity" value={senderCity} onChange={(e) => setSenderCity(e.target.value)} placeholder="Paris" className="rounded-xl" />
                  </div>
                </div>
              </div>
              <Button size="sm" onClick={() => handleGenerateText("letter")} disabled={generating || !senderName || !senderAddress || !senderPostalCode || !senderCity} className="rounded-xl">
                {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                Générer la lettre
              </Button>
              {generatedText && (
                <div className="mt-5 space-y-3">
                  <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-800">
                      <span className="text-xs font-medium text-zinc-500">Aperçu de la lettre</span>
                    </div>
                    <pre className="max-h-80 overflow-auto p-4 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">{generatedText}</pre>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={handleCopy} className="rounded-xl">
                      {copied ? <Check className="mr-1.5 h-3.5 w-3.5 text-green-500" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                      {copied ? "Copié !" : "Copier"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleDownload} className="rounded-xl">
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      Télécharger
                    </Button>
                    <Button size="sm" onClick={() => handleCreateRequest("LETTER")} disabled={creating} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                      J&apos;ai envoyé le courrier
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Steps */}
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-5 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Étapes de résiliation
        </h2>
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

      {/* Legal info collapsible */}
      {template.lawReference && (
        <button
          onClick={() => setShowLegal(!showLegal)}
          className="flex w-full items-center justify-between rounded-2xl border border-zinc-200/80 bg-white px-5 py-4 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/50"
        >
          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Informations légales</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${showLegal ? "rotate-180" : ""}`} />
        </button>
      )}
      {showLegal && template.lawReference && (
        <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-800/50">
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Cette résiliation est encadrée par la <strong>{template.lawReference}</strong>.
            {template.contractType === "Sans engagement" && " Votre abonnement est sans engagement, vous pouvez résilier à tout moment sans frais."}
            {template.noticeRequired && ` Un préavis de ${template.noticeRequired} jours est requis.`}
          </p>
        </div>
      )}
    </div>
  );
}
