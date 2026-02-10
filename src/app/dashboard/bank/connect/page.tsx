"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Upload,
  Search,
  Shield,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

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
  const [connecting, setConnecting] = useState(false);
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

  const filteredBanks = SUPPORTED_BANKS.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const handleConnect = async (bankId: string) => {
    setConnecting(true);
    setConnectError(null);

    try {
      const res = await fetch("/api/bank/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "bridge", bankId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setConnectError(data.error ?? "Erreur de connexion");
        return;
      }

      // Redirect to bank authorization page
      window.location.href = data.redirectUrl;
    } catch {
      setConnectError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setConnecting(false);
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
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Ajouter un compte bancaire
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Connectez votre banque ou importez vos relevés pour détecter vos abonnements
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="api" className="gap-2">
              <Building2 className="h-4 w-4" />
              Connexion API
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              Import manuel
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: API Connection */}
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Connecter ma banque</CardTitle>
                <CardDescription>
                  Connexion sécurisée via Open Banking (DSP2). Vos identifiants ne transitent jamais par nos serveurs.
                </CardDescription>
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant="success" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Connexion sécurisée DSP2
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {connectError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{connectError}</AlertDescription>
                  </Alert>
                )}

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    placeholder="Rechercher votre banque..."
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="grid gap-2">
                  {filteredBanks.map((bank) => (
                    <button
                      key={bank.id}
                      onClick={() => handleConnect(bank.id)}
                      disabled={connecting}
                      className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 text-left transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {bank.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {bank.name}
                        </p>
                      </div>
                      {bank.popular && <Badge variant="secondary">Populaire</Badge>}
                    </button>
                  ))}

                  {filteredBanks.length === 0 && (
                    <p className="py-8 text-center text-sm text-zinc-500">
                      Aucune banque trouvée pour &quot;{bankSearch}&quot;
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
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
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                    dragOver
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                      : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600"
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
                      <FileText className="mb-3 h-10 w-10 text-zinc-400" />
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
                <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
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
