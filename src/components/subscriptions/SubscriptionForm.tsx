"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SubscriptionFormProps {
  mode: "create" | "edit";
  initialData?: {
    id?: string;
    merchantName?: string;
    displayName?: string | null;
    amount?: number;
    frequency?: string;
    category?: string | null;
    status?: string;
    nextChargeDate?: string | null;
    commitmentEndDate?: string | null;
    notes?: string | null;
  };
}

const FREQUENCIES = [
  { value: "WEEKLY", label: "Hebdomadaire" },
  { value: "BIWEEKLY", label: "Bi-hebdomadaire" },
  { value: "MONTHLY", label: "Mensuel" },
  { value: "BIMONTHLY", label: "Bimestriel" },
  { value: "QUARTERLY", label: "Trimestriel" },
  { value: "SEMIANNUAL", label: "Semestriel" },
  { value: "ANNUAL", label: "Annuel" },
];

const CATEGORIES = [
  { value: "subscription", label: "Abonnement" },
  { value: "streaming", label: "Streaming" },
  { value: "software", label: "Logiciel" },
  { value: "telecom", label: "Télécom" },
  { value: "housing", label: "Logement" },
  { value: "insurance", label: "Assurance" },
  { value: "health", label: "Santé" },
  { value: "transport", label: "Transport" },
  { value: "entertainment", label: "Divertissement" },
  { value: "shopping", label: "Shopping" },
];

const STATUSES = [
  { value: "ACTIVE", label: "Actif" },
  { value: "PAUSED", label: "En pause" },
  { value: "CANCELED", label: "Résilié" },
  { value: "ENDING_SOON", label: "Fin proche" },
];

function formatDateForInput(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
}

export function SubscriptionForm({ mode, initialData }: SubscriptionFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [merchantName, setMerchantName] = useState(initialData?.merchantName ?? "");
  const [displayName, setDisplayName] = useState(initialData?.displayName ?? "");
  const [amountEuros, setAmountEuros] = useState(
    initialData?.amount ? (initialData.amount / 100).toFixed(2) : ""
  );
  const [frequency, setFrequency] = useState(initialData?.frequency ?? "MONTHLY");
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [status, setStatus] = useState(initialData?.status ?? "ACTIVE");
  const [nextChargeDate, setNextChargeDate] = useState(
    formatDateForInput(initialData?.nextChargeDate)
  );
  const [commitmentEndDate, setCommitmentEndDate] = useState(
    formatDateForInput(initialData?.commitmentEndDate)
  );
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!merchantName.trim()) {
      setError("Le nom du marchand est requis");
      return;
    }

    const amount = Math.round(parseFloat(amountEuros) * 100);
    if (isNaN(amount) || amount <= 0) {
      setError("Le montant doit être un nombre positif");
      return;
    }

    setSaving(true);

    try {
      const body = {
        merchantName: merchantName.trim(),
        displayName: displayName.trim() || merchantName.trim(),
        amount,
        frequency,
        category: category || null,
        status,
        nextChargeDate: nextChargeDate || null,
        commitmentEndDate: commitmentEndDate || null,
        notes: notes.trim() || null,
      };

      const url =
        mode === "edit" && initialData?.id
          ? `/api/subscriptions/${initialData.id}`
          : "/api/subscriptions";

      const res = await fetch(url, {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur lors de la sauvegarde");
        toast.error("Erreur lors de la sauvegarde");
        return;
      }

      toast.success(
        mode === "create" ? "Abonnement ajouté" : "Abonnement modifié"
      );
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Erreur de connexion");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Ajouter un abonnement" : "Modifier l'abonnement"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="merchantName">Nom du service *</Label>
              <Input
                id="merchantName"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="Netflix, Spotify, EDF..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Nom affiché</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nom personnalisé (optionnel)"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (€) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amountEuros}
                onChange={(e) => setAmountEuros(e.target.value)}
                placeholder="9.99"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Fréquence *</Label>
              <select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="">— Aucune —</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {mode === "edit" && (
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nextChargeDate">Prochain prélèvement</Label>
              <Input
                id="nextChargeDate"
                type="date"
                value={nextChargeDate}
                onChange={(e) => setNextChargeDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commitmentEndDate">Fin d&apos;engagement</Label>
              <Input
                id="commitmentEndDate"
                type="date"
                value={commitmentEndDate}
                onChange={(e) => setCommitmentEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes personnelles..."
              rows={3}
              className="flex w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Ajouter" : "Enregistrer"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
