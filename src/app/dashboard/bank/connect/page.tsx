"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Upload,
  Search,
  Shield,
  Lock,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  X,
  FlaskConical,
} from "lucide-react";
import { toast } from "sonner";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SUPPORTED_BANKS } from "@/lib/bank-constants";

function BankConnectContent() {
  const router = useRouter();
  const [tab, setTab] = useState("api");
  const [bankSearch, setBankSearch] = useState("");
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    imported: number;
    skipped: number;
    total: number;
    bankFormat: string | null;
    errors?: string[];
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const popularBanks = SUPPORTED_BANKS.filter((b) => b.popular);
  const allBanks = SUPPORTED_BANKS.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const handleConnect = async (bankId: string) => {
    setConnectingId(bankId);
    setConnectError(null);

    try {
      const res = await fetch("/api/bank/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "bridge", bankId }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.detail
          ? `${data.error} — ${data.detail}`
          : (data.error ?? "Erreur de connexion");
        setConnectError(msg);
        return;
      }

      // Redirect to bank authorization page
      window.location.href = data.redirectUrl;
    } catch {
      setConnectError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setConnectingId(null);
    }
  };

  const handleFileUpload = useCallback(async (file: File) => {
    setUploading(true);
    setUploadError(null);
    setUploadResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/bank/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error ?? "Erreur lors de l'import");
        return;
      }

      setUploadResult({
        imported: data.imported,
        skipped: data.skipped,
        total: data.total,
        bankFormat: data.bankFormat,
        errors: data.errors,
      });
      toast.success(`${data.imported} transaction(s) importée(s)`);
    } catch {
      setUploadError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/bank">
            <Button variant="ghost" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Connecter une banque
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Sélectionnez votre banque pour une connexion sécurisée via Open Banking
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="api" className="gap-2">
              <Building2 className="h-4 w-4" />
              Connexion automatique
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              Import manuel
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: API Connection */}
          <TabsContent value="api" className="space-y-6">
            {/* Error */}
            {connectError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{connectError}</AlertDescription>
              </Alert>
            )}

            {/* Security badges */}
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="success" className="gap-1">
                <Shield className="h-3 w-3" />
                Connexion sécurisée DSP2
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" />
                Données chiffrées
              </Badge>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Rechercher votre banque..."
                value={bankSearch}
                onChange={(e) => setBankSearch(e.target.value)}
                className="h-11 pl-10 text-base"
              />
              {bankSearch && (
                <button
                  onClick={() => setBankSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Popular banks (only when not searching) */}
            {!bankSearch && (
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Banques populaires
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                  {popularBanks.map((bank) => (
                    <button
                      key={bank.id}
                      onClick={() => handleConnect(bank.id)}
                      disabled={connectingId !== null}
                      className="group flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-50 text-sm font-bold text-zinc-600 transition-transform group-hover:scale-110 dark:from-zinc-800 dark:to-zinc-800/50 dark:text-zinc-400">
                        {connectingId === bank.id ? (
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                        ) : (
                          bank.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <span className="text-center text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {bank.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* All banks / search results */}
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {bankSearch ? `Résultats pour "${bankSearch}"` : "Toutes les banques"}
              </h2>
              <div className="grid gap-2">
                {allBanks.map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => handleConnect(bank.id)}
                    disabled={connectingId !== null}
                    className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-left transition-all hover:border-blue-300 hover:shadow-sm disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-50 text-xs font-bold text-zinc-600 dark:from-zinc-800 dark:to-zinc-800/50 dark:text-zinc-400">
                      {connectingId === bank.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      ) : (
                        bank.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {bank.name}
                      </p>
                    </div>
                    {bank.popular && (
                      <Badge variant="secondary" className="text-[10px]">
                        Populaire
                      </Badge>
                    )}
                  </button>
                ))}

                {allBanks.length === 0 && (
                  <div className="flex flex-col items-center py-12 text-center">
                    <Search className="mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                    <p className="text-sm text-zinc-500">
                      Aucune banque trouvée pour &quot;{bankSearch}&quot;
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      Essayez un autre nom ou utilisez l&apos;import manuel
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Demo bank for sandbox */}
            {!bankSearch && (
              <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-4 dark:border-amber-700 dark:bg-amber-900/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <FlaskConical className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Demo Bank
                      </p>
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        Sandbox
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Banque de test pour simuler une connexion
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleConnect("demo")}
                    disabled={connectingId !== null}
                    className="shrink-0 gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
                  >
                    {connectingId === "demo" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "Tester"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB 2: Manual Upload */}
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Importer un relevé bancaire</CardTitle>
                <CardDescription>
                  Glissez-déposez votre fichier ou cliquez pour sélectionner. Nous détecterons automatiquement le format.
                </CardDescription>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="outline">CSV</Badge>
                  <Badge variant="outline">PDF</Badge>
                  <Badge variant="outline">OFX</Badge>
                  <Badge variant="outline">QIF</Badge>
                  <Badge variant="secondary">Max 10 Mo</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {uploadError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}

                {uploadResult && (
                  <Alert variant="success">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-medium">Import réussi !</p>
                      <p className="mt-1">
                        {uploadResult.imported} transaction(s) importée(s)
                        {uploadResult.skipped > 0 && `, ${uploadResult.skipped} doublon(s) ignoré(s)`}
                      </p>
                      {uploadResult.bankFormat && (
                        <p className="mt-1 text-xs opacity-80">
                          Format détecté : {uploadResult.bankFormat}
                        </p>
                      )}
                      {uploadResult.errors && uploadResult.errors.length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs">
                            {uploadResult.errors.length} avertissement(s)
                          </summary>
                          <ul className="mt-1 space-y-1 text-xs opacity-80">
                            {uploadResult.errors.map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        </details>
                      )}
                      <Button
                        variant="link"
                        className="mt-2 h-auto p-0 text-sm"
                        onClick={() => router.push("/dashboard/transactions")}
                      >
                        Voir les transactions →
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Drop zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-all ${
                    dragOver
                      ? "border-blue-500 bg-blue-50 shadow-inner dark:bg-blue-900/10"
                      : "border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/30"
                  }`}
                  role="button"
                  tabIndex={0}
                  aria-label="Zone de dépôt de fichier"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                  }}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mb-3 h-10 w-10 animate-spin text-blue-600" />
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Analyse du fichier en cours...
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <FileText className="h-7 w-7 text-zinc-400" />
                      </div>
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Glissez votre relevé ici ou cliquez pour sélectionner
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        CSV, PDF, OFX, QIF — Maximum 10 Mo
                      </p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.pdf,.ofx,.qif"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-hidden="true"
                  />
                </div>

                {/* Tutorial link */}
                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    <strong>Besoin d&apos;aide ?</strong>{" "}
                    <Link
                      href="/help/export-bank-statement"
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Comment exporter mon relevé bancaire ?
                    </Link>
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    Banques supportées : BNP Paribas, Crédit Agricole, Société Générale,
                    Boursorama, N26, et plus encore.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function BankConnectPage() {
  return (
    <ProtectedRoute>
      <BankConnectContent />
    </ProtectedRoute>
  );
}
